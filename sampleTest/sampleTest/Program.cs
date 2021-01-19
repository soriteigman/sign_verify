using System;
using System.Text;
using System.Security.Cryptography;
using System.IO;
using System.Net;
using System.Net.Sockets;

namespace sampleTest
{
	//practice calling server and sending and receiving info
    class Program
    {   static int INT_LEN_ARRAY = 4; //amount of bytes for each length field in email
        static int KEY_LEN = 260; //based on algorithm being used
        static int PORT = 5525;

        static void Main(string[] args)
        {

            String user = "a@addd.co.il"; 
            // Data buffer for incoming data.  
            byte[] bytes = new byte[1024];

            //seed from response
            String message1 = null;

            // Connect to a remote device.  
            try
            {
                // Establish the remote endpoint for the socket.  
                // This example uses port 6000 on the local computer.  
                IPAddress ipAddress = IPAddress.Parse("127.0.0.1");

                IPEndPoint remoteEP = new IPEndPoint(ipAddress, PORT);
                // Create a TCP/IP  socket. 
                Socket sender = new Socket(ipAddress.AddressFamily,
                    SocketType.Stream, ProtocolType.Tcp);
                // Connect the socket to the remote endpoint. Catch any errors.  
                try
                {
                    sender.Connect(remoteEP);

                    Console.WriteLine("Socket connected to {0}",
                        sender.RemoteEndPoint.ToString());

					while (true){
					
                    // Receive the request from the remote device.  
                    int bytesRec = sender.Receive(bytes);
                    message1 = Encoding.UTF8.GetString(bytes, 0, bytesRec);//converts received message to bytes
                    Console.WriteLine(message1);

                    // Encode the data string into a byte array.  
                    byte[] msg = Encoding.ASCII.GetBytes(user);

                    // Send the data through the socket.  
                    int bytesSent = sender.Send(msg);
					}
                    // Release the socket.  
                    sender.Shutdown(SocketShutdown.Both);
                    sender.Close();

                }
                catch (ArgumentNullException ane)
                {
                    Console.WriteLine("ArgumentNullException : {0}", ane.ToString());
                }
                catch (SocketException se)
                {
                    Console.WriteLine("SocketException : {0}", se.ToString());
                }
                catch (Exception e)
                {
                    Console.WriteLine("Unexpected exception : {0}", e.ToString());
                }

            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
            }
			
        }
       
    }
}
