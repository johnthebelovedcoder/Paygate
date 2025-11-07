import socket
from urllib.parse import urlparse

# Test if we can connect to the Supabase host
db_url = 'postgresql+asyncpg://postgres:3xrBa3dqGroX27Wi@db.ixbiabwdzmezugjtxnzi.supabase.co:5432/postgres'
parsed = urlparse(db_url.replace('postgresql+asyncpg', 'postgresql'))

print('Host:', parsed.hostname)
print('Port:', parsed.port)

try:
    # Test basic connectivity to the host
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(10)  # 10 second timeout
    result = sock.connect_ex((parsed.hostname, parsed.port))
    sock.close()
    
    if result == 0:
        print('Port is open and accessible')
    else:
        print('Port is not accessible or connection timed out')
except Exception as e:
    print('Connection test failed:', e)