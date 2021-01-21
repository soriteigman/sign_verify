import socket

PORT = 6626
MAX_REC = 1024
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
        #connection from browser
        client_socket, client_address = server_socket.accept()
        client_socket.settimeout(SOCKET_TIMEOUT)
        print("got a connection!")
        # receives client request
        recv = client_socket.recv(MAX_REC)
        if recv != b'':          
            while recv[-4:] != b'\r\n\r\nv' and recv[-4:] != b'\r\n\r\ns':  # empties socket until end character received
                recv += client_socket.recv(MAX_REC)
        print("whole message is" + recv.decode())
    except Exception as e:
        print(e)
    if recv != b'':
        print("received client message")
        # sends message to c#
        # s or v byte
        print(bytes([recv[-1]]))
        c_socket.send(bytes([recv[-1]]))
        # c_socket email address
        #print("split up received mssage" +str(recv.split(b'\r\n\r\n')))
        # http request header from the data in body
        message = recv.split(b'\r\n\r\n')[1]
        print(message)
        #splitting email address
        email = message.split(b'\n')[0]
        print(email)
        userMail = (str(len(email)).zfill(4)).encode() + email
        c_socket.send(userMail)
        # get request body
        req = b"\n".join(message.split(b'\n')[1:])
        print(req)
        sendStuff = (str(len(req)).zfill(4)).encode() + req
        #sendData = str(len(recv)+1).encode() +recv
        c_socket.send(sendStuff)
        print("waiting for c#")
        
        #get response
        response = c_socket.recv(MAX_REC)
        print(response)
        # testing - verifies
        c_socket.send(b'v')
        userMail = (str(len(email)).zfill(4)).encode() + email
        print(b"verfiy email sent:" + userMail)
        c_socket.send(userMail)
        sendStuff = (str(len(response)).zfill(4)).encode() + response
        c_socket.send(sendStuff)
        #response = c_socket.recv(MAX_REC)
        resp = c_socket.recv(MAX_REC)
        print(b"verified\n response: "+resp)


        # send
        # receives response from c# to send extension
        if resp.decode()=="true":
            response = "HTTP/1.1 200 OK Internal \r\n Access-Control-Allow-Origin: chrome-extension://*\r\n\r\n".encode() + response
        else:
            response = "HTTP/1.1 203 Non-Authoritative Information Internal \r\n Access-Control-Allow-Origin: chrome-extension://*\r\n\r\n".encode() + response

        client_socket.send(response)

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