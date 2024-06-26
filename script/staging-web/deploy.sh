 #!/bin/bash

CERT_PATH="/opt/alovoa/alovoa.pfx"
PORT=10082

cd ../..
fuser -k $PORT/tcp
npx serve dist --single -l $PORT --ssl-cert $CERT_PATH --ssl-pass "ssl-key" -c "../serve.json"

