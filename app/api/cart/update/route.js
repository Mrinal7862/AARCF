import connectDb from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request){
    try {
        const {userId} = await getAuth(request)
        const {cartData} = await request.json()
        
        await connectDb()
        const user = await User.findById(userId);

        user.cartItems = cartData; 

        user.save();

        console.log(userId, cartData)
        return NextResponse.json({success:true, messaage: "Cart Updated Successfully"}, {status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message: error.message})
    }
}