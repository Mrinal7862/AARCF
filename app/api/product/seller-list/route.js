import connectDb from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request){
    try {
        const {userId} = getAuth(request)

        const isSeller = authSeller(userId)

        if(!isSeller){
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
         
        console.log("nachna hai bulle")
        await connectDb()
        const products = await Product.find({})
        return NextResponse.json({success:true, products}, {status:200}) 

    } catch (error) {
        console.log(error)
        return NextResponse.json({message: error.message})
    }
}