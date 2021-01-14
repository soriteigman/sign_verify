package FinalProj;

import com.intel.crypto.CryptoException;
import com.intel.crypto.RsaAlg;
import com.intel.langutil.ArrayUtils;
import com.intel.util.*;

//
// Implementation of DAL Trusted Application: FinalProj 
//
// **************************************************************************************************
// NOTE:  This default Trusted Application implementation is intended for DAL API Level 7 and above
// **************************************************************************************************

public class SignKeys extends IntelApplet {
	boolean LOGGEDIN; //is this the correct email address
	RsaAlg RSA = null;
	short KEY_LEN = 256;
	/**
	 * This method will be called by the VM when a new session is opened to the Trusted Application 
	 * and this Trusted Application instance is being created to handle the new session.
	 * This method cannot provide response data and therefore calling
	 * setResponse or setResponseCode methods from it will throw a NullPointerException.
	 * 
	 * @param	request	the input data sent to the Trusted Application during session creation
	 * 
	 * @return	APPLET_SUCCESS if the operation was processed successfully, 
	 * 		any other error status code otherwise (note that all error codes will be
	 * 		treated similarly by the VM by sending "cancel" error code to the SW application).
	 */
	public int onInit(byte[] request) {
		DebugPrint.printString("Hello, DAL!");
		LOGGEDIN = false;
		return APPLET_SUCCESS;
	}
	
	/**
	 * This method will be called by the VM to handle a command sent to this
	 * Trusted Application instance.
	 * 
	 * @param	commandId	the command ID (Trusted Application specific) 
	 * @param	request		the input data for this command 
	 * @return	the return value should not be used by the applet
	 */
	public int invokeCommand(int commandId, byte[] request) {
		
		byte[] myResponse = null;		
		boolean success = false; //status of command

		try {
		DebugPrint.printString("Received command Id: " + commandId + ".");
		
		if(request != null)
		{
			DebugPrint.printString("Received buffer:");
			DebugPrint.printBuffer(request);

		}
				
		switch(commandId) {
		case 1: //receives username and returns public key
			//logs in - sets user if nonexistent, and verifies this is the same email as saved in memory otherwise
			login(request); 
			if (LOGGEDIN) {
				//sets key if nonexistant and gets public key from key saved in memory if exists. 
				set_if_exists(); //sets public key if saved in memory
				if (RSA == null) //set key
				{
					try {
						success = generateKeyPair();
						}
						catch(IllegalUseException ie) {
							DebugPrint.printString("Cannot reset key.");
							success = false;
						}
				}
				else 
					success = true; //RSA exists and login was successful
				if (success) {
				//sets public key for response
				myResponse = new byte[KEY_LEN+4];
				try {
					myResponse = getPublicKey();
				}
				catch(IllegalUseException ie) {
					throw ie;
					}
				}				
			}
			break;

		case 2: //sign email data
			try {
			myResponse = signData(request);
			}
			catch(IllegalUseException ie) {
				throw ie;
			}

		case 3: //retracts permission to sign to verify safety
			success = logout();
			break;
		}

		}
		catch(IllegalUseException ie) {
			myResponse = new byte[]{'I','N','V','A','L','I','D',' ', 'K','E','Y'};
		}
		catch (Exception e){
			String mess = e.getMessage();
			
			DebugPrint.printString(mess + " from exception " + e.getClass());
			}
		finally
		{
			if (myResponse == null) {
				if (success) {
					myResponse = new byte[] {'O','K'};
				}
				else {	
					myResponse = new byte[] {'F','A','I','L'};
				}
				}
				
				
				/*
				 * To return the response data to the command, call the setResponse
				 * method before returning from this method. 
				 * Note that calling this method more than once will 
				 * reset the response data previously set.
				 */
				setResponse(myResponse, 0, myResponse.length);

				/*
				 * In order to provide a return value for the command, which will be
				 * delivered to the SW application communicating with the Trusted Application,
				 * setResponseCode method should be called. 
				 * Note that calling this method more than once will reset the code previously set. 
				 * If not set, the default response code that will be returned to SW application is 0.
				 */
				setResponseCode(commandId);

				/*
				 * The return value of the invokeCommand method is not guaranteed to be
				 * delivered to the SW application, and therefore should not be used for
				 * this purpose. Trusted Application is expected to return APPLET_SUCCESS code 
				 * from this method and use the setResposeCode method instead.
				 */

		}
		return APPLET_SUCCESS;
	}
	
	
	/**
	 * @return public RSA key
	 * @throws IllegalUseException if key doesn't exist
	 */
	private byte[] getPublicKey() throws IllegalUseException{
		set_if_exists();
		if (RSA == null) {
			throw new IllegalUseException("no key exists"); 
		}
		byte[] pub = new byte[RSA.getModulusSize()+ RSA.getPublicExponentSize()];
		RSA.getKey(pub, (short)0, pub, RSA.getModulusSize());
		return pub;
	}
	
	/**
	 * signs data received
	 * @param request
	 * @return signature
	 * @throws IllegalUseException if key doesn't exist
	 */
	private byte[] signData(byte[] request) throws IllegalUseException{
		set_if_exists();
		if (RSA == null)
		{
			throw new IllegalUseException("no key exists"); 
		}
		
		try {
		byte[] en = new byte[RSA.getSignatureLength()];//signed request
		RSA.signComplete(request, (short)0, (short)request.length, en, (short)0);
		return en;
		}
		catch(NotInitializedException ne) {
			DebugPrint.printString("not initialized exception" + ne.getMessage());
			

		}
		catch(CryptoException ce) {
			DebugPrint.printString("crypto exception" + ce.getMessage() + ce.getClass());
		}
		return null;
		
	}
	

	/**
	 * sets instance of RSA for instance from mem
	 * true if successful false otherwise
	 */
	private boolean set_if_exists(){
	if (RSA == null) {
		RSA = getRSA();
	}
	return RSA == null;
	
		
	}

/**
 * generates RSA key and saves in flash storage 1
 * @return true if succeeded false otherwise
 * @throws throws IllegalUseException for key already saved
 */
	private boolean generateKeyPair() throws IllegalUseException{
		if (RSA != null || getRSA() != null)
			 throw new IllegalUseException("key pair already generated");  
		try{
		//create and saves
		RSA = RsaAlg.create();
		RSA.generateKeys((short) KEY_LEN); //2048Kbit
		RSA.setPaddingScheme(RsaAlg.PAD_TYPE_PKCS1);
		RSA.setHashAlg(RsaAlg.HASH_TYPE_SHA256);
		short mod = RSA.getModulusSize(), e = RSA.getPublicExponentSize(), d = RSA.getPrivateExponentSize();
		byte[] key= new byte[d+mod+e];
		RSA.getKey(key,(short)0, key, mod, key, (short)(mod + e));
		//save array to memory
		FlashStorage.writeFlashData(1, key, 0, key.length);			
		
		RSA = null;
		RSA = getRSA();
		
		DebugPrint.printString("key saved to memory");
		return true;
		}
		
		catch(Exception e) {
			return false;
		}
	}

	/**
	 * 
	 * @return RSA instance if saved in memory otherwise null
	 */
	private RsaAlg getRSA() {
		
		byte[] dest = new byte[521];
		
		if (FlashStorage.getFlashDataSize(1)==0) // nothing to read
		{
		DebugPrint.printString("no RSA saved in memory");
		return null;
		}	
		try {
		FlashStorage.readFlashData(1, dest, 0);
		if (dest != null && dest.length>0) {
			RsaAlg rsa = RsaAlg.create();
			rsa.setPaddingScheme(RsaAlg.PAD_TYPE_PKCS1);
			rsa.setHashAlg(RsaAlg.HASH_TYPE_SHA256);
			rsa.setKey(dest, (short)0, KEY_LEN, dest, KEY_LEN, (short)4, dest, (short)(KEY_LEN+4), (short)256);		
			//sets from memory
			DebugPrint.printString("saved RSA from memory to RSA");
			return rsa;
		}
		}
		catch(Exception e) {
			return null;
		}
		return null;
	}

	/**
	 * logs user out by changing loggedin variable
	 * @return if successfully logged out
	 */
	private boolean logout() {
		LOGGEDIN = false;
		RSA = null;
		return (!LOGGEDIN);
	}

	/**
	 * 
	 * @param request username
	 * @return logs user in and saves to memory if not saved. 
	 * false if username already set and request doesn't match original username.
	 */
	private boolean login(byte[] request) {
		byte[] username = getUser();
		if (username != null) {//already set
			DebugPrint.printString("username:\n");
			DebugPrint.printBuffer(username);
			if (!LOGGEDIN){
			LOGGEDIN = sameUser(request); //logs in and compares them
		}
		}
		else//no user set
		{
			LOGGEDIN = setUser(request); //sets user
		}
		
		return LOGGEDIN;
	}

	/**
	 * @username user to compare against
	 * @return true if user email matches saved user and false otherwise
	 */
	private boolean sameUser(byte[] username) {
		byte [] savedUser = getUser(), paddedUsername = new byte[100];
		
		//copies entered password into array with zeros at end to help compare with saved one
		System.arraycopy(username, 0, paddedUsername, 0, username.length);
		return ArrayUtils.compareByteArray(paddedUsername,0,savedUser, 0, paddedUsername.length);
	}

	/**
	 * saves user to storage on first time
	 * @return true if user was successfully saved, false otherwise
	 * @throws IllegalArgumentException if user already set
	 */
	private boolean setUser(byte[] username) throws IllegalArgumentException {
		if (username == null || username.length > 100) {
			return false;
		}
		byte[] old = getUser();
		if (old!=null && old.length > 0) {
			throw new IllegalArgumentException("duplicate user!"); //a user was already saved
		}
		try {
		FlashStorage.writeFlashData(0, username, 0, username.length);
		}
		catch(Exception e)
		{
			DebugPrint.printString("unable to save user to memory");
			return false;
		}
		return getUser().length > 0;
		// return true if user was saved. false otherwise
		
	}
	
	/**
	 * 
	 * @return username from flash storage. empty byte array if non-existent
	 */
	private byte[] getUser() {
		byte[] dest = new byte[100];
		if (FlashStorage.getFlashDataSize(0)==0) // nothing to read
			{
			DebugPrint.printString("nothing to read");
			return null;
			}
		try {
		FlashStorage.readFlashData(0, dest, 0);
		return dest;
		}
		catch(Exception e) {
			return null;
		}
	}	
	
	
	/**
	 * This method will be called by the VM when the session being handled by
	 * this Trusted Application instance is being closed 
	 * and this Trusted Application instance is about to be removed.
	 * This method cannot provide response data and therefore
	 * calling setResponse or setResponseCode methods from it will throw a NullPointerException.
	 * 
	 * @return APPLET_SUCCESS code (the status code is not used by the VM).
	 */
		
	public int onClose() {
		DebugPrint.printString("Goodbye, DAL!");
		return APPLET_SUCCESS;
	}
}
