import connectDb from "@/config/db";
import authSeller from "@/lib/authSeller";
import Address from "@/models/Address";
import Order from "@/models/Order";
import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(request){
    try {
        const  {userId} = useAuth(request)
        const isSeller = await authSeller(userId)

        if(!isSeller){
            return NextResponse.json({success: false, message: "Un-authorized Access"})
        }

        await connectDb();

        Address.length
        const order = await Order.find({}).populate("address item product userId")

        return NextResponse.json({success: true, order})
    } catch (error) {
        console.log(error)
        return NextResponse.json({success: false, message: error.message})
    }
}