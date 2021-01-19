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

# build socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

server_socket.bind(("0.0.0.0", PORT))
server_socket.listen()
print("Listening for connections on port {}".format(PORT))

print("waiting for connections")
# c# socket
c_socket, c_address = server_socket.accept()
print("c# connected!")
# send
c_socket.send("connected".encode())

while True:
    try:
        client_socket, client_address = server_socket.accept()
        client_socket.settimeout(SOCKET_TIMEOUT)
        print("got a connection!")
        # receives client request
        recv = client_socket.recv(MAX_REC)
        print (recv)
        while recv[-4:] != b'\r\n\r\n':  # empties socket until end character received
            recv += client_socket.recv(MAX_REC)
        print("whole message is" + recv.decode())
    except Exception as e:
        print(e)

    print("received client message")
    
    user = c_socket.recv(MAX_USER_ID).decode()

    print("id is", user, end = "")

    # send
    # receives response from c# to send extension
    
    response = "HTTP/1.1 200 OK Internal\r\n Access-Control-Allow-Origin: chrome-extension://*\r\n\r\n" + user
    client_socket.send(response.encode())

    # close connection
    print("closing connection")
    client_socket.close()
    
print("closing connection")
c_socket.close()
server_socket.close()
'''print("saving information to file")
# save user information and seed to file
with open("secret.txt", 'w') as file:
    file.write(user + " : " + seed + "\n")

'''