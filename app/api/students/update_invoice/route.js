// /api/students/update_invoice
import { SupabaseClient } from "@supabase/supabase-js";
import verifyJWT from "@/components/util_function/verifyJWT";
import { NextResponse } from "next/server";
const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Update invoice status to Unconfirmed
// Request Header
//// jwt: JWT Token
//// invoice_id: Invoice ID

export async function PUT(request) {
	const token = request.headers.get('jwt');
	const decodedJWT = verifyJWT(token);
	const studentUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	// Check if the user is a student
	const { data: studentData, error: studentError } = await supabase.from('students').select("proxy_ids").eq('id', studentUUID);
	if (studentError) {
		return NextResponse.json({ message: "Failed to get student data" }, { status: 500 });
	}
	if (studentData.length === 0) {
		return NextResponse.json({ message: "User is not a student" }, { status: 401 });
	}

	const invoiceID = request.headers.get('invoice_id');
	const { data: invoiceData, error: invoiceError } = await supabase.from('invoices').select('status, student_proxy_id').eq('id', invoiceID);
	if (invoiceError) {
		return NextResponse.json({ message: "Failed to get invoice data" }, { status: 500 });
	}
	if (invoiceData.length === 0) {
		return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
	}
	if (!studentData[0].proxy_ids.includes(invoiceData[0].student_proxy_id)) {
		return NextResponse.json({ message: "Unauthorized Request" }, { status: 401 });
	}

	if (invoiceData[0].status == "Pending"){
		const {data, error} = await supabase.from('invoices').update({ status: 'Unconfirmed' }).eq('id', invoiceID);
		if (error) {
			return NextResponse.json({ message: "Failed to update invoice status" }, { status: 500 });
		}
	}
	return NextResponse.json({ message: "Invoice updated" }, { status: 200 });
}
