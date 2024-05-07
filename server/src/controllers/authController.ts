import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AuthEmail } from "../emails/AuthEmail";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body;
            const userExists = await User.findOne({ email });
            if (userExists) {
                const error = new Error("El email ya esta en uso");
                return res.status(409).json({ error: error.message });
            }
            // Create a new user
            const user = new User(req.body);
            // Hash the password
            user.password = await hashPassword(password);

            //generar el token
            const token = new Token();
            token.token = generateToken();
            token.user = user.id;

            // Send confirmation email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token,
            });
            // Save the user and the token
            await Promise.allSettled([token.save(), user.save()]);
            res.send("Usuario creado!!");
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token.findOne({ token }).populate("user");
            if (!tokenExists) {
                const error = new Error("Token invalido");
                return res.status(404).json({ error: error.message });
            }
            const user = await User.findById(tokenExists.user.id);
            user.confirmed = true;
            await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
            res.send("Cuenta confirmada!!");
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error("Usuario no encontrado");
                return res.status(404).json({ error: error.message });
            }
            if (!user.confirmed) {
                const token = new Token();
                token.user = user.id;
                token.token = generateToken();

                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token,
                });

                const error = new Error(
                    "La cuenta no ha sido confirmada, hemos enviado un nuevo email de confirmación"
                );
                return res.status(401).json({ error: error.message });
            }

            const isPasswordCorrect = await checkPassword(
                password,
                user.password
            );
            if (!isPasswordCorrect) {
                const error = new Error("Contraseña incorrecta");
                return res.status(401).json({ error: error.message });
            }
            res.send("Usuario logueado!!");
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    };
}
