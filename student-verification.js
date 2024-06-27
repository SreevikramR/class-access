import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function verifyPayment(studentId) {
    const { data, error } = await supabase
        .from('payments')
        .select('paid')
        .eq('student_id', studentId)
        .single();

    if (error) {
        console.error('Error verifying payment:', error);
        return false;
    }

    return data ? data.paid : false;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { studentId } = req.body;

        try {
            const hasPaid = await verifyPayment(studentId);
            res.status(200).json({ hasPaid });
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify payment status', details: error });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}