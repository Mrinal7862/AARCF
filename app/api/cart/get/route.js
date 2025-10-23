import connectDb from "@/config/db"
import User from "@/models/User"
import { NextResponse } from "next/server"

const { getAuth } = require("@clerk/nextjs/server")

export async function GET(request){
    try {
        const {userId} = getAuth(request)

        await connectDb()
        const user = await User.findById(userId);

        const {cartItems} = user;

        console.log(cartItems)
        return NextResponse.json({success: true, cartItems}, {status: 200})
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({message: error.message})
    }
}