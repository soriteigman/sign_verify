using System;
using System.Text;
using Intel.Dal;
using System.Security.Cryptography;

namespace FinalProjHost
{
    class Program
    {
        static void Main(string[] args)
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

            /*
             * converts string message to byte
             */
            Func<String, byte[]> convertMessage = (mess) =>
            {
                byte[] sendBuff = null;
                if (mess != null)
                {
                    sendBuff = UTF32Encoding.UTF8.GetBytes(mess);
                }
                return sendBuff;
            };

            // Send and Receive data to/from the Trusted Application

            byte[] recvBuff;

            //generate key
            Console.Out.WriteLine("Generating key...");
            recvBuff = sendRecv(null, 1);
            String status = Encoding.UTF8.GetString(recvBuff);
            if (status == "DUPLICATE")
            {
                Console.WriteLine(status + ": key already set. Using saved key...");
            }
            else
            {
                Console.Out.WriteLine("Status: " + status);
            }
            //public key get
            Console.Out.WriteLine("Retrieving key...");
            byte[] pubKey = sendRecv(null, 2);
            if (Encoding.UTF8.GetString(pubKey) != "FAIL")
                Console.Out.WriteLine("Public key retrieved.");
            else
            {
                Console.Out.WriteLine("Can't access public key. Closing app.");
                goto close;
            }

            //creating nonce
            Console.Out.WriteLine("Creating nonce...");
            //Allocate a buffer
            var nonce = new byte[20];
            //Generate a cryptographically random set of bytes
            using (var Rnd = RandomNumberGenerator.Create())
            {
                Rnd.GetBytes(nonce);
            }


            //sign
            Console.Out.WriteLine("Signing data...");
            byte[] message = nonce;
            recvBuff = sendRecv(message, 3);
            status = Encoding.UTF8.GetString(recvBuff);
            if (status == "FAIL")
            {
                Console.Out.WriteLine("Unable to continue.\nClosing app...");
                goto close;
            }
            Console.Out.WriteLine("Data signed.");


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
            bool t = r.VerifyData(message, "Sha256", recvBuff);

            if (t)
                Console.Out.WriteLine("Signature was verified.");
            else
                Console.Out.WriteLine("Signature could not be verified.");

            close:
            // Close the session
            Console.WriteLine("Closing the session.");
            jhi.CloseSession(session);

            //Uninstall the Trusted Application
            Console.WriteLine("Uninstalling the applet.");
            jhi.Uninstall(appletID);

            Console.WriteLine("Press Enter to finish.");
            Console.Read();
        }
    }
}