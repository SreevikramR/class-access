import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function addPayment(studentId, studentName, paid) {
    const { data, error } = await supabase
        .from('payments')
        .insert([
            { student_id: studentId, student_name: studentName, paid: paid }
        ]);

    if (error) {
        console.error('Error adding payment record:', error);
        return error;
    }
    return data;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { studentId, studentName, paid } = req.body;

        try {
            const data = await addPayment(studentId, studentName, paid);
            res.status(200).json({ message: 'Payment record added successfully', data });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add payment record', details: error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
