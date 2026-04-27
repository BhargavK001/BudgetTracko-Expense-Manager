const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Account = require('../models/Account');
const DeletionLog = require('../models/DeletionLog');

/**
 * GET /api/sync/pull?since=<ISO_timestamp>
 * Returns all records modified after `since` for the authenticated user.
 * If `since` is omitted, returns ALL records (full sync).
 */
exports.pullChanges = async (req, res) => {
    try {
        const userId = req.user.id;
        const since = req.query.since ? new Date(req.query.since) : new Date(0);

        const filter = { userId, updatedAt: { $gt: since } };

        const [transactions, budgets, categories, accounts, deletions] = await Promise.all([
            Transaction.find(filter).populate('accountId', 'name type').lean(),
            Budget.find(filter).lean(),
            Category.find(filter).lean(),
            Account.find(filter).lean(),
            DeletionLog.find({ userId, deletedAt: { $gt: since } }).lean()
        ]);

        res.json({
            success: true,
            data: {
                transactions,
                budgets,
                categories,
                accounts,
                deletions: deletions.map(d => ({
                    entityType: d.entityType,
                    entityId: d.entityId,
                    deletedAt: d.deletedAt
                }))
            },
            serverTime: new Date().toISOString()
        });
    } catch (error) {
        console.error('Sync pull error:', error);
        res.status(500).json({ success: false, message: 'Sync pull failed' });
    }
};

/**
 * POST /api/sync/push
 * Receives batched offline changes from the client.
 * Body: {
 *   changes: [
 *     { action: 'create'|'update'|'delete', entityType: 'transaction'|'budget'|'category'|'account', data: {...}, clientUpdatedAt: ISO }
 *   ]
 * }
 * Returns: { conflicts: [...], applied: number }
 */
exports.pushChanges = async (req, res) => {
    try {
        const userId = req.user.id;
        const { changes } = req.body;

        if (!Array.isArray(changes) || changes.length === 0) {
            return res.json({ success: true, applied: 0, conflicts: [] });
        }

        const modelMap = {
            transaction: Transaction,
            budget: Budget,
            category: Category,
            account: Account
        };

        const conflicts = [];
        let applied = 0;

        for (const change of changes) {
            const { action, entityType, data, clientUpdatedAt } = change;
            const Model = modelMap[entityType];

            if (!Model) continue;

            try {
                if (action === 'create') {
                    const existing = data._id ? await Model.findById(data._id).lean() : null;
                    if (existing) {
                        // Already exists — treat as update
                        if (new Date(clientUpdatedAt) >= new Date(existing.updatedAt)) {
                            const { _id, __v, createdAt, updatedAt, ...updateData } = data;
                            await Model.findByIdAndUpdate(existing._id, { ...updateData, userId });
                            applied++;
                        } else {
                            conflicts.push({ entityType, entityId: existing._id.toString(), serverVersion: existing });
                        }
                    } else {
                        const { _id, __v, createdAt, updatedAt, ...createData } = data;
                        // Use client _id if provided (for consistent IDs)
                        const newDoc = new Model({ ...createData, userId, ...(data._id ? { _id: data._id } : {}) });
                        await newDoc.save();
                        applied++;
                    }
                } else if (action === 'update') {
                    const entityId = data._id || data.id;
                    if (!entityId) continue;

                    const existing = await Model.findById(entityId).lean();
                    if (!existing) {
                        // Record doesn't exist on server — create it
                        const { _id, __v, createdAt, updatedAt, ...createData } = data;
                        const newDoc = new Model({ ...createData, userId, _id: entityId });
                        await newDoc.save();
                        applied++;
                    } else if (new Date(clientUpdatedAt) >= new Date(existing.updatedAt)) {
                        // Client is newer — apply update
                        const { _id, __v, createdAt, updatedAt, ...updateData } = data;
                        await Model.findByIdAndUpdate(entityId, updateData);
                        applied++;
                    } else {
                        // Server is newer — conflict, server wins
                        conflicts.push({ entityType, entityId: entityId.toString(), serverVersion: existing });
                    }
                } else if (action === 'delete') {
                    const entityId = data._id || data.id;
                    if (!entityId) continue;

                    const deleted = await Model.findOneAndDelete({ _id: entityId, userId });
                    if (deleted) {
                        await DeletionLog.create({ userId, entityType, entityId: entityId.toString() });
                        applied++;
                    }
                }
            } catch (changeError) {
                console.error(`Sync push error for ${action} ${entityType}:`, changeError.message);
            }
        }

        res.json({ success: true, applied, conflicts });
    } catch (error) {
        console.error('Sync push error:', error);
        res.status(500).json({ success: false, message: 'Sync push failed' });
    }
};
