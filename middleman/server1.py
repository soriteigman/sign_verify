import socket
import random

MAX_USER_ID = 256
RAND_LEN = 6
PORT = 6000


# connects
server_socket = socket.socket()
server_socket.bind(("0.0.0.0", PORT))
server_socket.listen()

print("waiting for connections")
(client_socket, client_address) = server_socket.accept()

print("client connected")
# send
client_socket.send("do you hear me?".encode())


user = client_socket.recv(MAX_USER_ID).decode()

print("id is", user, end = "")


# close connection
print("closing connection")
client_socket.close()
server_socket.close()

'''print("saving information to file")
# save user information and seed to file
with open("secret.txt", 'w') as file:
    file.write(user + " : " + seed + "\n")

'''