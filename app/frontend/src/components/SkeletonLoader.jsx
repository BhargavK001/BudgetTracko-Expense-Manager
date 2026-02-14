import { motion } from 'framer-motion';

const SkeletonLoader = ({ className, width, height, variant = 'rect' }) => {
    return (
        <motion.div
            className={`bg-gray-200 dark:bg-gray-800 overflow-hidden relative ${className}`}
            style={{
                width,
                height,
                borderRadius: variant === 'circle' ? '50%' : '12px'
            }}
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
        </motion.div>
    );
};

export default SkeletonLoader;
