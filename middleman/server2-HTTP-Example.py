import socket


MAX_USER_ID = 256
PORT = 5555
IP = '0.0.0.0'
SOCKET_TIMEOUT = 10
MAX_REC = 128


def handle_client_request(resource, client_socket):
    """ Check the required resource, generate proper HTTP response and send to client"""
    http_response = "HTTP/1.1 500 Error Server Internal\r\n\r\nInvalid HTTP request"
    # send response
    client_socket.send(http_response)
    print("response sent")


def validate_http_request(request):
    """ Check if request is a valid HTTP request
    and returns TRUE / FALSE and the requested URL"""
    http_parts = request.split(" ")  # split into words by spaces

    # http request with URL
    if http_parts[0] == 'GET' and http_parts[1][0] == '/' and http_parts[2] == "HTTP/1.1\r\n":
        return True, http_parts[1]
    return False, ""


def respond_http_request(client_socket, recv):
    """
    handles creating appropriate response and sending it to the http client.
    return true if request was valid and false otherwise
    """
    # first line of http request. adds \r\n after split
    client_request = " ".join(recv.split()[:3]) + "\r\n"

    # validate http request
    valid_http, resource = validate_http_request(client_request)

    if valid_http:
        print('Got a valid HTTP request')
        handle_client_request(resource, client_socket)
        return True

    else:
        # send error message
        http_response = "HTTP/1.1 200 OK Internal\r\n\r\nWrite long detailed message here to show in server"
        client_socket.send(http_response.encode())
        client_socket.close()
        return False
        
        
def handle_client(client_socket):
    """ Handles client requests: receives request and calls function to create response"""
    print('Client connected')
    client_socket.setblocking(True)

    while True:
        try:

            # receives client request
            recv = client_socket.recv(MAX_REC).decode()
            if recv == '':  # if client closed connection
                print('Closing connection')
                client_socket.close()
                break
            recvend = recv
            while recvend[-4:] != b'\r\n\r\n':  # empties socket of rest of header
                recvend = client_socket.recv(MAX_REC)
        except BlockingIOError as e:
            print(e)
            client_socket.close()
            break
        except socket.timeout as e:
            print(e)
            client_socket.close()
            break
        except ConnectionError as e:
            print(e)
            client_socket.close()
            break
        except Exception as e:
            print(e)
            client_socket.close()
            break

        # handles response and stops loop if error
        if not respond_http_request(client_socket, recv):
            client_socket.close()
            break


def main():
    # Open a socket and loop forever while waiting for clients
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((IP, PORT))
    server_socket.listen()
    print("Listening for connections on port {}".format(PORT))

    while True:
        client_socket, client_address = server_socket.accept()
        print('New connection received')
        client_socket.settimeout(SOCKET_TIMEOUT)
        handle_client(client_socket)




if __name__ == "__main__":
    # Call the main handler function
    main()