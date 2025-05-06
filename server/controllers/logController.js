const { LOG_ACTIVITY, LOG_AKSES } = require('../models');

exports.getAllLogActivity = async (req, res) => {
    try {
        const { id: userId, level: userRole } = req.user;

        // Check if the user has the required role
        if (userRole !== 'SUA') {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
        }

        // Fetch all log activity records
        const allLogActivity = await LOG_ACTIVITY.findAll();
        return res.status(200).json(allLogActivity);
    } catch (error) {
        console.error('Error fetching log activity:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getAllLogAkses = async (req, res) => {
    try {
        const { id: userId, level: userRole } = req.user;

        // Check if the user has the required role
        if (userRole !== 'SUA') {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
        }

        // Fetch all log akses records
        const allLogAkses = await LOG_AKSES.findAll();
        return res.status(200).json(allLogAkses);
    } catch (error) {
        console.error('Error fetching log akses:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};