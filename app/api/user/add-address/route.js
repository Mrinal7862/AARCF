import connectDb from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// import { requestToBodyStream } from "next/dist/server/body-streams";

export async function POST(request){
    try {
        const {userId} = getAuth(request);
        const {address} = await request.json()

        await connectDb();
        const newAddress = await Address.create({...address, userId})

        return NextResponse.json({success: true, message: "Address Added Successfully", newAddress})

    } catch (error) {
        console.log(error);
        return NextResponse.json({success: false, message: error.message})
    }
}