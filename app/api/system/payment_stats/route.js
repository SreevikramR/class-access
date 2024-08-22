// /api/students/update_invoice
import { SupabaseClient } from "@supabase/supabase-js";
import verifyJWT from "@/components/util_function/verifyJWT";
import { NextResponse } from "next/server";
const supabase = new SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Update invoice status to Student Confirmed
// Request Header
//// jwt: JWT Token
//// payment_value: value of the payment

export async function PUT(request) {
	const token = request.headers.get('jwt');
	const decodedJWT = verifyJWT(token);
	if (!decodedJWT) {
		return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
	}

	const paymentValue = request.headers.get('payment_value');
	const { data, error } = await supabase.from('statistics').select('*').eq('id', "1");

	if (error) {
		console.log("error adding to statistics")
		return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
	}

	const newTotalIncome = data[0].payments_volume + parseInt(paymentValue);
	const paymentsProcessed = data[0].payments_processed + 1;

	const { data: updateData, error: updateError } = await supabase.from('statistics').update([
		{ payments_volume: newTotalIncome, payments_processed: paymentsProcessed }
	]).eq('id', "1");

	if (updateError) {
		console.log("error updating statistics")
		console.log(updateError)
		return NextResponse.json({ message: "Error updating data" }, { status: 500 });
	}

	return NextResponse.json({ message: "Invoice updated" }, { status: 200 });
}
