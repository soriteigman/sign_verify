using System;
using System.Text;
using Intel.Dal;
using System.Security.Cryptography;

namespace FinalProjHost
{
    
    class Program
    {
        static int INT_LEN_ARRAY = 4; //amount of bytes for each length field in email

        static void Main(string[] args)
        {

            /*
           if (SIGN) { */

            //creating nonce
            Console.Out.WriteLine("Creating nonce...");
            //Allocate a buffer
            var emailBody = new byte[20];
            //Generate a cryptographically random set of bytes
            using (var Rnd = RandomNumberGenerator.Create())
            {
                Rnd.GetBytes(emailBody);
            }

            String username = "Avi@gmail.com";

            //returns byte array of all information necessary to verify the email.
            byte[] email = signFunc(username, emailBody);

            /*}
           else { */
            //save public key in file with email. 
            //verifies that this is the same as the other ones if already has this email on file


            //verifies bytes at end of email given
            Console.WriteLine("verified: " + verifyFunc(email));
            // }

            Console.WriteLine("Press Enter to finish.");
            Console.Read();
        }


        /*
         * signs the message received and returns the formatted message for the email in bytes
         */
        public static byte[] signFunc(string username, byte[] emailBody)
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
            string appletID = "69d60184-b11c-43d1-a8ed-527f045cac14";
            // This is the path to the Intel Intel(R) DAL Trusted Application .dalp file that was created by the Intel(R) DAL Eclipse plug-in.

            string appletPath = "C:\\DALapps\\sign_verify\\FinalProj\\bin\\FinalProj.dalp";//for regular program
            //appletPath = "C:\\DALapps\\sign_verify\\FinalProj\\bin\\FinalProj-debug.dalp"; //for debugger

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
            byte[] pubKey = sendRecv(convertMessage(username), 1);
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
        private static bool verifySameKey(string username, byte[] pubKey)
        {

            return true;
        }

        /*
         * formats pubkey and emailbody in an email. first four bytes are length of emailbody, second four are length of signature
         */
        private static byte[] createEmail(byte[] pubKey, byte[] signedEmail, byte[] emailBody)
        {
            //format : int int body signature key
            int emailLen= emailBody.Length;
            int signLen = signedEmail.Length;
            //lengths in bits
            byte[] emailLenB = BitConverter.GetBytes(emailLen), signLenB = BitConverter.GetBytes(signLen);

            //total email size
            byte[] finalEmail = new byte[2* INT_LEN_ARRAY + signedEmail.Length + emailBody.Length + pubKey.Length];

            if (emailLenB.Length != INT_LEN_ARRAY )
            {
                Console.WriteLine("error in conversion of int to bytes");
            }
           
            Array.Copy(emailLenB, finalEmail, INT_LEN_ARRAY); //copies length of email
            Array.Copy(signLenB, 0, finalEmail, INT_LEN_ARRAY, INT_LEN_ARRAY); //copies length of signature
            Array.Copy(emailBody, 0, finalEmail, 2* INT_LEN_ARRAY, emailBody.Length); //copies  email
            Array.Copy(signedEmail, 0, finalEmail, 2 * INT_LEN_ARRAY + emailBody.Length, signedEmail.Length); //copies signed email
            Array.Copy(pubKey, 0, finalEmail, 2 * INT_LEN_ARRAY + emailBody.Length + signedEmail.Length, pubKey.Length); //copies public key

            return finalEmail;
        }


        /*
         * verfies email sent. 
         * extracts public key, original email and signed email and sends to verify func as three arguments
          */
        public static bool verifyFunc(byte[] wholeEmail)
            
        {
            //extract lengths of fields
            byte[] emailLen = new byte[INT_LEN_ARRAY], 
                signLen = new byte[INT_LEN_ARRAY];

            Array.Copy(wholeEmail, emailLen, INT_LEN_ARRAY);
            Array.Copy(wholeEmail, INT_LEN_ARRAY, signLen, 0, INT_LEN_ARRAY);
            int sign = BitConverter.ToInt32(signLen, 0);
            int mail = BitConverter.ToInt32(emailLen, 0);
            int keyLen = 260; //based on algorithm being used
            //lengths
            byte[] email = new byte[mail], 
                signature = new byte[sign], 
                pubKey = new byte[keyLen];

            //extracts parts
            Array.Copy(wholeEmail, 2*INT_LEN_ARRAY, email, 0, mail);
            Array.Copy(wholeEmail, 2* INT_LEN_ARRAY + mail, signature, 0, sign);
            Array.Copy(wholeEmail, 2 * INT_LEN_ARRAY + mail + sign, pubKey, 0, keyLen);

            return verifyFunc(pubKey, email, signature);
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
        private static byte[] convertMessage (String mess)
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