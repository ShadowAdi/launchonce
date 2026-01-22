import { db } from "@/db/db";
import { users } from "@/db/schema";
import { CreateUserDto } from "@/types/user/create-user.dto";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const createUser = async (payload: CreateUserDto) => {
    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, payload.email))
            .limit(1);
        if (existingUser.length > 0) {
            console.error(`User Already Exists`);
            throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(payload.password, 10);

        const [user] = await db.insert(users).values({
            name: payload.name,
            email: payload.email,
            password: hashedPassword,
        }).returning({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
        })

        return user
    } catch (error) {
        console.error(`Failed to create user: ${error}`);
        throw new Error(error instanceof Error ? error.message : `Failed to create user`)
    }
};
