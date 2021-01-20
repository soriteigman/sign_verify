using System;
using System.Text;
using Intel.Dal;
using System.Security.Cryptography;
using System.IO;
using System.Net;
using System.Net.Sockets;

namespace signVerifyHost
{
    class Program
    { 
        static int INT_LEN_ARRAY = 4; //amount of bytes for each length field in email
        static int KEY_LEN = 260; //based on algorithm being used
        static int PORT = 6626;


        static void Main(string[] args)
        {

            // Data buffer for incoming data.  
            byte[] bytes = new byte[2048];

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

                    int bytesRec = sender.Receive(bytes);
                    message1 = Encoding.UTF8.GetString(bytes, 0, bytesRec);//converts received message to bytes
                    Console.WriteLine(message1);

                    while (true)
                    {
                        byte[] sign_verify = new byte[1];//                                                                       sign_verify
                        sender.Receive(sign_verify, 0, 1, SocketFlags.None);//receives one byte
                        byte[] length = new byte[4];
                        sender.Receive(length, 0, 4, SocketFlags.None);//receives length of email address
                        Console.WriteLine(length);
                        string len = Encoding.UTF8.GetString(length, 0, 4);
                        Console.WriteLine(len);
                        int leng = Int32.Parse(len);
                        Console.WriteLine(leng);
                        byte[] userEmail = new byte[leng];//                                                                       userEmail
                        sender.Receive(userEmail, 0, leng, SocketFlags.None);//receives email address
                        Console.WriteLine("user email "+ Encoding.UTF8.GetString(userEmail,0,leng));
                        length = new byte[4];
                        sender.Receive(length, 0, 4, SocketFlags.None);//receives length of body
                        len = Encoding.UTF8.GetString(length, 0, 4);
                        leng = Int32.Parse(len);
                        byte[] emailBody = new byte[leng];//                                                                       emailBody
                        sender.Receive(emailBody, 0, leng, SocketFlags.None);//receives email body
                        Console.WriteLine("email body " + Encoding.UTF8.GetString(emailBody, 0, leng));

                        if (Encoding.UTF8.GetString(sign_verify, 0, 1) == "s")//in case of sign
                        {

                            //returns byte array of all information necessary to verify the email.
                            byte[] email = signFunc(userEmail, emailBody);
                            if (email == null)
                            { /*some error message returned*/
                                Console.WriteLine("email value is null");
                                byte[] err = convertMessage("error");
                                sender.Send(err);
                            }
                            else
                            {
                                sender.Send(email);
                            }

                        }
                        else//    in case of verify
                        {
                            //verifies bytes at end of email given
                            bool verified = verifyFunc(userEmail, emailBody);
                            Console.WriteLine("verified: " + verified);

                            if (verified)
                            {
                                byte[] t = convertMessage("true");
                                sender.Send(t);
                                Console.WriteLine("sent verification");
                            }
                            else
                            {
                                byte[] f = convertMessage("false");
                                sender.Send(f);
                            }
                        }

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

        

       
            Console.WriteLine("Press Enter to finish.");
            Console.Read();
        }


        /*
         * signs the message received and returns the formatted message for the email in bytes
         */
        public static byte[] signFunc(byte[] username, byte[] emailBody)
        {

#if AMULET
            // When compiled for Amulet the Jhi.DisableDllValidation flag is set to true 
            // in order to load the JHI.dll without DLL verification.
            // This is done because the JHI.dll is not in the regular JHI installation folder, 
            // and therefore will not be found by the JhiSharp.dll.
            // After disabling the .dll validation, the JHI.dll will be loaded using the Windows search path
            // and not by the JhiSharp.dll (see http://msdn.microsoft.com/en-us/library/7d83bc18(v=vs.100).aspx for 
            // details on the search path that is used by Windows to locate a DLL) 
            // In this case the JHI.dll will be loaded from the $(OutDir) folder (bin\Amulet by default),
            // which is the directory where the executable module for the current process is located.
            // The JHI.dll was placed in the bin\Amulet folder during project build.
            Jhi.DisableDllValidation = true;
#endif

            Jhi jhi = Jhi.Instance;
            JhiSession session;

            // This is the UUID of this Trusted Application (TA).
            //The UUID is the same value as the applet.id field in the Intel(R) DAL Trusted Application manifest.
            string appletID = "ea12e55b-60a2-4311-a159-194d7f393d43";
            // This is the path to the Intel Intel(R) DAL Trusted Application .dalp file that was created by the Intel(R) DAL Eclipse plug-in.
            string appletPath = "C:\\Users\\sorit\\Documents\\computers\\third year\\semester 1\\dal- secure environment code\\signature extension\\signVerify\\bin\\signVerify.dalp";

            // Install the Trusted Application
            Console.WriteLine("Installing the applet.");
            jhi.Install(appletID, appletPath);

            // Start a session with the Trusted Application
            byte[] initBuffer = new byte[] { }; // Data to send to the applet onInit function
            Console.WriteLine("Opening a session.");
            jhi.CreateSession(appletID, JHI_SESSION_FLAGS.None, initBuffer, out session);

            /**
             * function performs send and receive. 
             * returns status of action
             */
            Func<byte[], int, byte[]> sendRecv = (sendBuff, cmdId) =>
            {
                byte[] recvBuff1 = new byte[2000]; // A buffer to hold the output data from the TA
                int responseCode; // The return value that the TA provides using the IntelApplet.setResponseCode method
                jhi.SendAndRecv2(session, cmdId, sendBuff, ref recvBuff1, out responseCode);
                return recvBuff1;
            };


            byte[] recvBuff;
            String status;
            bool success = true; //indicates unexpected error if false
            byte[] returnEmail = null; //format return email

            //send request for public key in cmd id and username

            //public key get
            Console.Out.WriteLine("Retrieving key for user...");
            //convert email to byte[] username and ask for public key, 
            //from key instance stored in DAL safe memory
            byte[] pubKey = sendRecv(username, 1);
            if (Encoding.UTF8.GetString(pubKey) != "FAIL")
            {
                Console.Out.WriteLine("Public key retrieved.");
                if (!verifySameKey(username, pubKey))
                {
                    Console.WriteLine("invalid public key!");
                    success = false;
                }
            }

            else
            {
                Console.Out.WriteLine("Can't access public key. Closing app.");
                success = false;
            }

            if (success)
            {
                //sign email
                Console.Out.WriteLine("Signing data...");
                byte[] message = emailBody;
                recvBuff = sendRecv(message, 2);
                status = Encoding.UTF8.GetString(recvBuff);
                if (status == "FAIL")
                {
                    Console.Out.WriteLine("Unable to continue.\nClosing app...");
                    success = false;
                }
                if (success)
                {
                    Console.Out.WriteLine("Data signed.");

                    Console.WriteLine("Formatting return email");
                    returnEmail = createEmail(pubKey, recvBuff, emailBody);
                }

            }
            //log out
            Console.Out.WriteLine("Logging out...");
            recvBuff = sendRecv(null, 3);
            Console.Out.WriteLine("Logout status: " + UTF32Encoding.UTF8.GetString(recvBuff));

            // Close the session
            Console.WriteLine("Closing the session.");
            jhi.CloseSession(session);

            //Uninstall the Trusted Application
            Console.WriteLine("Uninstalling the applet.");
            jhi.Uninstall(appletID);

            return returnEmail;

        }



        /*
         * receives public key and username
         * saves to database if nonexistant
         * if exists checks that public key matches pubic key saved
         */
        private static bool verifySameKey(byte[] username, byte[] pubKey)
        {
            //todo- future version
            return true;
        }

        /*
         * formats pubkey and emailbody in an email. first four bytes are length of emailbody, second four are length of signature
         */
        private static byte[] createEmail(byte[] pubKey, byte[] signedEmail, byte[] emailBody)
        {
            //format : int int body signature key
            int emailLen = emailBody.Length;
            int signLen = signedEmail.Length;
            //lengths in bits
            byte[] emailLenB = BitConverter.GetBytes(emailLen), signLenB = BitConverter.GetBytes(signLen);

            //total email size
            byte[] finalEmail = new byte[2 * INT_LEN_ARRAY + signedEmail.Length + emailBody.Length + pubKey.Length];

            if (emailLenB.Length != INT_LEN_ARRAY)
            {
                Console.WriteLine("error in conversion of int to bytes");
            }

            Array.Copy(emailLenB, finalEmail, INT_LEN_ARRAY); //copies length of email
            Array.Copy(signLenB, 0, finalEmail, INT_LEN_ARRAY, INT_LEN_ARRAY); //copies length of signature
            Array.Copy(emailBody, 0, finalEmail, 2 * INT_LEN_ARRAY, emailBody.Length); //copies  email
            Array.Copy(signedEmail, 0, finalEmail, 2 * INT_LEN_ARRAY + emailBody.Length, signedEmail.Length); //copies signed email
            Array.Copy(pubKey, 0, finalEmail, 2 * INT_LEN_ARRAY + emailBody.Length + signedEmail.Length, pubKey.Length); //copies public key

            Console.WriteLine("final email lenfth is "+finalEmail.Length);
            return finalEmail;
        }


        /*
         * verfies email sent. 
         * extracts public key, original email and signed email and sends to verify func as three arguments
          */
        public static bool verifyFunc(byte[] username, byte[] wholeEmail)
        {
            try
            {


                //extract lengths of fields
                byte[] emailLen = new byte[INT_LEN_ARRAY],
                    signLen = new byte[INT_LEN_ARRAY];
                //Array.Copy(source,destinationArray,len)
                Array.Copy(wholeEmail, emailLen, INT_LEN_ARRAY);
                Array.Copy(wholeEmail, INT_LEN_ARRAY, signLen, 0, INT_LEN_ARRAY);
                int sign = BitConverter.ToInt32(signLen, 0);
                int mail = BitConverter.ToInt32(emailLen, 0);
                //lengths
                byte[] email = new byte[mail],
                signature = new byte[sign],
                pubKey = new byte[KEY_LEN];


                //extracts parts
                Array.Copy(wholeEmail, 2 * INT_LEN_ARRAY, email, 0, mail);
                Array.Copy(wholeEmail, 2 * INT_LEN_ARRAY + mail, signature, 0, sign);
                Array.Copy(wholeEmail, 2 * INT_LEN_ARRAY + mail + sign, pubKey, 0, KEY_LEN);

                //save public key in file with email. 
                //verifies that this is the same as the other ones if already has this email on file
                return verifySameKey(username, pubKey) && verifyFunc(pubKey, email, signature);
            }
            catch(Exception e)
            {
                Console.WriteLine(e);
                return false;
            }

        }
        /* 
         * verifies email received based on public key
         */
        private static bool verifyFunc(byte[] pubKey, byte[] originalEmail, byte[] signedEmail)
        {
            //verify
            Console.Out.WriteLine("Verifying signature...");
            RSAParameters rsa = new RSAParameters();
            byte[] e = new byte[4];
            byte[] mod = new byte[256];
            Array.Copy(pubKey, 256, e, 0, 4);
            Array.Copy(pubKey, 0, mod, 0, 256);
            //extract mod and e from public key
            rsa.Exponent = e;
            rsa.Modulus = mod;
            RSACryptoServiceProvider r = new RSACryptoServiceProvider();
            r.ImportParameters(rsa);
            bool t = r.VerifyData(originalEmail, "Sha256", signedEmail);

            return t;

        }



        /*
             * converts string message to byte
             */
        private static byte[] convertMessage(String mess)
        {
            byte[] sendBuff = null;
            if (mess != null)
            {
                sendBuff = UTF32Encoding.UTF8.GetBytes(mess);
            }
            return sendBuff;
        }

    }
}