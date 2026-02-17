import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Built-in icons

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, Kiru</Text>
        <Text style={styles.subGreeting}>Welcome back to BudgetTracko</Text>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>₹ 45,000.00</Text>
        <View style={styles.incomeExpenseContainer}>
          <View>
            <Text style={styles.arrow}>↓ Income</Text>
            <Text style={styles.smallAmount}>₹ 60,000</Text>
          </View>
          <View>
            <Text style={styles.arrow}>↑ Expense</Text>
            <Text style={styles.smallAmount}>₹ 15,000</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.btnText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Placeholder */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {/* Dummy Item 1 */}
      <View style={styles.transactionItem}>
        <View style={styles.iconBox}>
          <Ionicons name="fast-food" size={20} color="#FF5733" />
        </View>
        <View style={styles.transDetails}>
          <Text style={styles.transName}>Burger King</Text>
          <Text style={styles.transDate}>Today, 12:30 PM</Text>
        </View>
        <Text style={styles.negativeAmount}>- ₹ 250</Text>
      </View>

      {/* Dummy Item 2 */}
      <View style={styles.transactionItem}>
        <View style={styles.iconBox}>
          <Ionicons name="briefcase" size={20} color="#28B463" />
        </View>
        <View style={styles.transDetails}>
          <Text style={styles.transName}>Salary</Text>
          <Text style={styles.transDate}>Yesterday, 9:00 AM</Text>
        </View>
        <Text style={styles.positiveAmount}>+ ₹ 60,000</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subGreeting: { fontSize: 14, color: '#666' },

  balanceCard: {
    backgroundColor: '#2E86C1',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceLabel: { color: '#BDC3C7', fontSize: 14 },
  balanceAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  incomeExpenseContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  arrow: { color: '#BDC3C7', fontSize: 12 },
  smallAmount: { color: 'white', fontSize: 16, fontWeight: '600' },

  actionRow: { marginVertical: 20, alignItems: 'center' },
  addButton: {
    backgroundColor: '#000',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnText: { color: 'white', marginLeft: 10, fontWeight: '600' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  iconBox: { width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  transDetails: { flex: 1 },
  transName: { fontSize: 16, fontWeight: '600' },
  transDate: { fontSize: 12, color: '#888' },
  negativeAmount: { color: '#E74C3C', fontWeight: 'bold' },
  positiveAmount: { color: '#27AE60', fontWeight: 'bold' },
});