import socket



MAX_USER_ID = 256
RAND_LEN = 6
PORT = 5525
MAX_REC = 128
SOCKET_TIMEOUT = 10


def application(environ, start_response):
  if environ['REQUEST_METHOD'] == 'OPTIONS':
    start_response(
      '200 OK',
      [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Headers', 'Authorization, Content-Type'),
        ('Access-Control-Allow-Methods', 'POST'),
      ]
    )
    return ''

# server_socket = socket.socket()
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_socket.bind(("0.0.0.0", PORT))
server_socket.listen()
print("Listening for connections on port {}".format(PORT))

print("waiting for connections")
client_socket, client_address = server_socket.accept()
client_socket.settimeout(SOCKET_TIMEOUT)
print("got a connection!")
try:
    # receives client request
    recv = client_socket.recv(MAX_REC).decode()
    recvend=recv
    print (recv)
    while recvend[-4:] != b'\r\n\r\n':  # empties socket until end character received
        recvend = client_socket.recv(MAX_REC)
        print(recvend.decode())
except Exception as e:
    print(e)

print("received client message")
# send
client_socket.send("HTTP/1.1 200 OK Internal\r\n Access-Control-Allow-Origin: chrome-extension://*\r\n\r\nWrite long detailed message here to show in server".encode())

# close connection
print("closing connection")
client_socket.close()
server_socket.close()

'''# connects to c# host
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
'''
'''print("saving information to file")
# save user information and seed to file
with open("secret.txt", 'w') as file:
    file.write(user + " : " + seed + "\n")

'''