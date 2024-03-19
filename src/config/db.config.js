import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export default prisma;

export async function connDB() {
    try {
        await prisma.$connect();
        console.log(`🎉 Connected to Database`);
    } catch (error) {
        console.log(error);
    }
}
