 #!/bin/bash

CERT_PATH="/opt/alovoa/alovoa.pfx"
PORT=10080

cd ../..
fuser -k $PORT/tcp
nohup npx serve dist --single -l $PORT --ssl-cert $CERT_PATH --ssl-pass "ssl-key" &
