import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Reco System" <no-reply@reco.com>',
            to: email,
            subject: subject,
            html: html,
        });

        return true;
    } catch (error) {
        // If email fails, let's at least see the OTP in the terminal so you can register!
        console.log("❌ Email failed, but here is your code:", html);
        return false;
    }
};