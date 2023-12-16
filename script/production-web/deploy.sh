 #!/bin/bash

CERT_PATH="/opt/alovoa/alovoa.pfx"

cd ../..
npx serve dist --single -l 10080 --ssl-cert $CERT_PATH

