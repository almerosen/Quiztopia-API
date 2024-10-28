import bcrypt from "bcryptjs"

export const passwordCheck = async (password, user) => {
    const correctPassword = await bcrypt.compare(password, user.hashedPassword)

    return correctPassword
}
