const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const userControllers = require("../controllers/userControllers");

// Simuler une liste noire de tokens
let blacklist = [];

// Middleware pour vérifier si le token est en liste noire
const checkTokenBlacklist = (req, res, next) => {
    const token = req.headers["authorization"];
    
    if (blacklist.includes(token)) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    next();
};

// Route pour la déconnexion
router.post("/logout", (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(400).json({ message: "Token manquant" });
    }

    // Ajouter le token à la liste noire
    blacklist.push(token);

    res.status(200).json({ message: "Déconnexion réussie !" });
});

router.get("/profile", checkTokenBlacklist, catchErrors(userControllers.getProfile));
router.post("/login", catchErrors(userControllers.login));
router.post("/register", catchErrors(userControllers.register));

module.exports = router;