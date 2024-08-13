// app/api/meetings/create/gmeet/route.js

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fetchTimeout from '@/components/util_function/fetch';
import verifyJWT from '@/components/util_function/verifyJWT';
import { SpacesServiceClient } from '@google-apps/meet';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
	const jwt = request.headers.get('jwt');

	const decodedJWT = verifyJWT(token);
	const teacherUUID = decodedJWT?.sub;
	if (!decodedJWT) {
		return NextResponse.json({message: "Invalid Token"}, {status: 401});
	}

	const { data, error } = await supabase.from('teachers').select('email').eq('id', teacherUUID);
	if (error) {
		return NextResponse.json({ error: 'Server Error' }, { status: 500 });
	} else if (data.length == 0) {
		return NextResponse.json({ error: 'Teacher not found' }, { status: 500 });
	}


	if (error) {
		return NextResponse.json({ error: 'Email Failed' }, { status: 500 });
	}
	return NextResponse.json({ message: 'Email Sent' }, { status: 200 });
}
