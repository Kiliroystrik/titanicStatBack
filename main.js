import express, { query } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import { PassengersModel } from "./Model/PassengersModel.js";
import { UsersModel } from "./Model/usersModel.js";
import { check, validationResult } from "express-validator";

// Connexion à la base de données
mongoose
    .connect("mongodb://localhost:27017/titanic", {
        useNewUrlParser: true,
        useUnifiedTopology: true, // options qui évitent des warnings inutiles
    })
    .then(init); // Toutes les méthodes de mongoose renvoient des promesses

async function init() {

    // Initialisation de l'app Express
    const app = express();
    app.use(cors())
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json())


    /**
    * Passengers
    */

    app.get("/passengers", [
        check("sex").optional().matches(/^(male|female)(,(male|female))*$/),
        check("survived").optional().matches(/^(0|1)(,(0|1))*$/),
        check("age").optional(),
        check("pclass").optional().matches(/^(1|2|3)(,(1|2|3))*$/),
    ], async (req, res) => {
        //la variable "errors" utilise la méthode "validationResult(req)" pour vérifier si il y a des erreurs de validation. Si il y en a, un statut HTTP 400 et les erreurs sont renvoyées au client.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let query = {};
            for (const key in req.query) {
                if (req.query.hasOwnProperty(key)) {
                    if (key == "sex") {
                        query.Sex = { $in: req.query.sex.split(",") };
                    }
                    else if (key == "survived") {
                        query.Survived = { $in: req.query.survived.split(",") };
                    }
                    else if (key == "age") {
                        query.Age = req.query.age;
                    }
                    else if (key == "pclass") {
                        query.Pclass = { $in: req.query.pclass.split(",") };
                    }
                }
            }

            let options = {};
            if (req.query.limit) {
                options.limit = parseInt(req.query.limit);
            }
            if (req.query.skip) {
                options.skip = parseInt(req.query.skip);
            }
            const Passengers = await PassengersModel.find(query, null, options);
            res.json(Passengers);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });




    app.get("/passengers/search/:name", async (req, res) => {
        try {
            // Ici on passe un regex dans le nom avec $regex
            // L'option sert à demander le case insensitive

            const Passengers = await PassengersModel.find({ Name: { $regex: req.params.name, $options: "i" } });
            res.json(Passengers);
        } catch (err) {
            res.status(500).send(err.message);
        }
    })


    /**
     * Users
     */

    app.post("/auth/login", async (req, res) => {
        try {

            const Users = await UsersModel.findOne(req.body);
            if (Users == null || Users == "") {
                res.status(401).send("Utilisateur non trouvé ou mot de passe incorrect");
            } else {

                res.json(req.body);
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    })

    app.post("/auth/subscribe", async (req, res) => {
        try {

            const Users = await UsersModel.findOne(req.body);
            if (Users) {
                res.status(401).send("Utilisateur déjà existant, merci de vous connecter");
            } else {
                const newUser = await UsersModel.create(req.body)
                res.json("Utilisateur enregistré");
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    })


    // Démarrage de l'app Express
    app.listen(8000, () =>
        console.log(`Server running at http://localhost:8000/`)
    );
}