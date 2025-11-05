from passlib.context import CryptContext

# Create a password context that uses bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# The password you want to hash
password = "password123"  # Change this to your desired password

# Generate the hash
hashed_password = pwd_context.hash(password)

print(f"Password: {password}")
print(f"Hashed password: {hashed_password}")
