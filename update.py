import cgi
import cgitb; cgitb.enable()  # for troubleshooting

from socket import *

def main()
	serverName = 'localhost'
	serverPort = 80

	clientSocket = socket(AF_INET, SOCK_DGRAM)
	message = raw_input('Msg:')
	#text = bytes(message, 'UTF-8')

	clientSocket.sendto(message,(serverName, serverPort))

	modifiedMessage, serverAddress = clientSocket.recvfrom(2048)
	#print(modifiedMessage)

	clientSocket.close()
	
	cgi.escape(modifiedMessage)