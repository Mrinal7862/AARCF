import { inngest } from "@/config/inngest"
import Product from "@/models/Product"
import { NextResponse } from "next/server"

const { getAuth, User } = require("@clerk/nextjs/server")

export async function POST(request){
    try {
        const {userId} = getAuth(request)

        const {address, items} = await request.json()

        if(!address || items.length === 0){
            return NextResponse.json({success: false, message: "Address and items are required"}, {status: 400})
        }

        // Calculate amount 
        const amount = await items.reduce(async (acc, item) =>{
            const product  = await Product.findById(item.product);
            return await acc + (product.offerPrice * item.quantity);
        }, 0)

        // 
        await inngest.send({
            name: "Order/Created",
            data: {
                userId,
                address,
                items,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now()
            }
        })
        // clear user Cart 
        const user = await User.findById(userId);
        user.cartItems = {}
        await user.save();

        return NextResponse.json({success: true, message: "Order Placed Successfully"})
    } catch (error) {
        return NextResponse.json({success: true, message: error.message})

    }
}