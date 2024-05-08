import { transporter } from "../config/nodemailer";

interface IEmail {
    email: string;
    name: string;
    token: string;
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: '"Fred Foo 👻" <admin@admin.net>',
            to: user.email,
            subject: "Hello ✔",
            text: "Hello world?",
            html: `<p>hola ${user.name} tenemos tus datos 😈😈</p>
                <p>Visita el siguiente enlace para confirmar tu cuenta</p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                <p>Ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos luego de recibir este correo</p>
            `,
        });
    };
    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: '"Fred Foo 👻" <admin@admin.net>',
            to: user.email,
            subject: "Reestablece tu contraseña",
            text: "Reestablece tu constraseña",
            html: `<p>hola ${user.name}, has solicitado el cambio de contraseña, si esto fue un accidente ignora el correo.</p>
                <p>Visita el siguiente enlace para confirmar tu cuenta</p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer tu contraseña</a>
                <p>Ingresa el codigo: <b>${user.token}</b></p>
                <p>Este token expira en 10 minutos.</p>
            `,
        });
    };
}
