const { MailtrapClient } = require("mailtrap");

export async function POST(request) {
    const TOKEN = process.env.EMAIL_TOKEN;
    const ENDPOINT = process.env.EMAIL_ENDPOINT;
    
    const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });
    const student_email = request.headers.get('student_email');
    const teacher_name = request.headers.get('teacher_name');
    const class_name = request.headers.get('class_name');
    const class_code = request.headers.get('class_code');

    const token = request.headers.get('jwt');
    let user_uuid = '';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user_uuid = decoded.sub;
    } catch (err) {
        return new Response('Invalid Token', { status: 401 });
    }

    console.log(student_email, teacher_name, class_name, class_code)

    const link = `https://classaccess.tech/join_class/${class_code}`;

    const sender = {
        email: "no-reply@classaccess.tech",
        name: "Class Access",
    };

    const student_emails = student_email.split(/\s*,\s*/);
    console.log(student_emails);

    let recipients = [];
    for (var i = 0; i < student_emails.length; i++) {
        console.log(student_emails[i]);
        recipients.push({
            "email": student_emails[i],
        });
    }

    console.log(recipients);

    try {
        client.send({
            from: sender,
            to: recipients,
            template_uuid: "6f61e827-4cf8-4a79-8392-0aec29839e7c",
            template_variables: {
                "teacher_name": teacher_name,
                "class_name": class_name,
                "next_step_link": link
            }
        })

        return new Response('Email sent', { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500 });
    }

}