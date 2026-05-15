export const checkAdminType = (allowedTypes = []) => {
    return (req, res, next) => {
        const admin = req.admin;
        if (!admin) {
            return res.status(401).json({ message: "Admin not authenticated" });
        }

        if (!allowedTypes.includes(admin.admin_type)) {
            return res.status(403).json({
                message: `Access denied. Allowed types: ${allowedTypes.join(", ")}`
            });
        }

        next();
    };
};