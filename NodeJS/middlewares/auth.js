const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        // Vérifiez la présence de l'en-tête Authorization
        if (!req.headers.authorization) {
            return res.status(403).json({ message: "Forbidden" });
        }
        
        // Extraire le token du header Authorization
        const token = req.headers.authorization.split(" ")[1];
        
        // Vérifier le token avec le secret
        const payload = await jwt.verify(token, process.env.SECRET);
        
        // Attacher le payload au request object pour un accès ultérieur
        req.payload = payload;
        
        // Passer au prochain middleware ou route
        next();
    } catch (err) {
        // Gestion des erreurs d'authentification
        res.status(401).json({ message: "Forbidden" });
    }
};
