import os
import hashlib
import base64
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
from lxml import etree
import qrcode
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class DigitalSigner:
    def __init__(self, private_key_path=None, public_key_path=None):
        """Initialize with paths to RSA keys"""
        self.private_key = None
        self.public_key = None
        
        if private_key_path and os.path.exists(private_key_path):
            with open(private_key_path, 'rb') as f:
                self.private_key = serialization.load_pem_private_key(
                    f.read(), password=None, backend=default_backend()
                )
            # CRITICAL FIX: Extract public key from loaded private key
            self.public_key = self.private_key.public_key()
            logger.info(f"Loaded existing private key from {private_key_path}")
        else:
            # Generate new key pair if not exists
            logger.info("Generating new RSA key pair...")
            self.private_key = rsa.generate_private_key(
                public_exponent=65537, key_size=2048, backend=default_backend()
            )
            self.public_key = self.private_key.public_key()
            
            # Save keys
            self._save_keys(private_key_path, public_key_path)
            logger.info("New key pair generated and saved")
    
    def _save_keys(self, private_path, public_path):
        """Save RSA keys to files"""
        backend_root = os.path.dirname(os.path.dirname(__file__))
        keys_dir = os.path.join(backend_root, 'keys')
        os.makedirs(keys_dir, exist_ok=True)
        
        private_path = private_path or os.path.join(keys_dir, 'private_key.pem')
        public_path = public_path or os.path.join(keys_dir, 'public_key.pem')
        
        # Save private key
        with open(private_path, 'wb') as f:
            f.write(self.private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Save public key
        with open(public_path, 'wb') as f:
            f.write(self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
        
        logger.info(f"Keys saved to {keys_dir}")
    
    def sign_xml(self, xml_content: str, certificate_id: str) -> str:
        """Sign XML content and add digital signature"""
        try:
            # Parse XML
            root = etree.fromstring(xml_content.encode('utf-8'))
            
            # Calculate digest
            canonical_xml = etree.tostring(root, method='c14n')
            digest = hashlib.sha1(canonical_xml).digest()
            digest_b64 = base64.b64encode(digest).decode('utf-8')
            
            # Sign the digest
            signature = self.private_key.sign(
                canonical_xml,
                padding.PKCS1v15(),
                hashes.SHA1()
            )
            signature_b64 = base64.b64encode(signature).decode('utf-8')
            
            # Get public key for KeyInfo
            public_pem = self.public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ).decode('utf-8')
            
            # Create Signature element
            ns_ds = "http://www.w3.org/2000/09/xmldsig#"
            NSMAP = {
                'ds': ns_ds,
                'dcc': 'https://ptb.de/dcc',
                'si': 'https://ptb.de/si'
            }
            
            signature_elem = etree.Element(f"{{{ns_ds}}}Signature", nsmap={'ds': ns_ds})
            
            # SignedInfo
            signed_info = etree.SubElement(signature_elem, f"{{{ns_ds}}}SignedInfo")
            
            canonicalization = etree.SubElement(signed_info, f"{{{ns_ds}}}CanonicalizationMethod")
            canonicalization.set('Algorithm', 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315')
            
            sig_method = etree.SubElement(signed_info, f"{{{ns_ds}}}SignatureMethod")
            sig_method.set('Algorithm', 'http://www.w3.org/2000/09/xmldsig#rsa-sha1')
            
            reference = etree.SubElement(signed_info, f"{{{ns_ds}}}Reference")
            reference.set('URI', '')
            
            transforms = etree.SubElement(reference, f"{{{ns_ds}}}Transforms")
            transform = etree.SubElement(transforms, f"{{{ns_ds}}}Transform")
            transform.set('Algorithm', 'http://www.w3.org/2000/09/xmldsig#enveloped-signature')
            
            digest_method = etree.SubElement(reference, f"{{{ns_ds}}}DigestMethod")
            digest_method.set('Algorithm', 'http://www.w3.org/2000/09/xmldsig#sha1')
            
            digest_value = etree.SubElement(reference, f"{{{ns_ds}}}DigestValue")
            digest_value.text = digest_b64
            
            # SignatureValue
            sig_value = etree.SubElement(signature_elem, f"{{{ns_ds}}}SignatureValue")
            sig_value.text = signature_b64
            
            # KeyInfo
            key_info = etree.SubElement(signature_elem, f"{{{ns_ds}}}KeyInfo")
            key_value = etree.SubElement(key_info, f"{{{ns_ds}}}KeyValue")
            rsa_key_value = etree.SubElement(key_value, f"{{{ns_ds}}}RSAKeyValue")
            
            # Extract modulus and exponent
            public_numbers = self.public_key.public_numbers()
            modulus = etree.SubElement(rsa_key_value, f"{{{ns_ds}}}Modulus")
            modulus.text = base64.b64encode(
                public_numbers.n.to_bytes((public_numbers.n.bit_length() + 7) // 8, 'big')
            ).decode('utf-8')
            
            exponent = etree.SubElement(rsa_key_value, f"{{{ns_ds}}}Exponent")
            exponent.text = base64.b64encode(
                public_numbers.e.to_bytes((public_numbers.e.bit_length() + 7) // 8, 'big')
            ).decode('utf-8')
            
            # Insert signature as last child of root
            root.append(signature_elem)
            
            # Return signed XML
            return etree.tostring(root, encoding='utf-8', xml_declaration=True, pretty_print=True).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error signing XML: {e}", exc_info=True)
            raise
    
    def generate_qr_code(self, certificate_id: str, verification_url: str) -> str:
        """Generate QR code for certificate verification"""
        try:
            # Create verification URL with certificate ID
            qr_data = f"{verification_url}/{certificate_id}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            return f"data:image/png;base64,{qr_base64}"
            
        except Exception as e:
            logger.error(f"Error generating QR code: {e}", exc_info=True)
            raise

    def verify_xml_signature(self, xml_content: str) -> dict:
        """Verify XML signature and extract signature information"""
        try:
            root = etree.fromstring(xml_content.encode('utf-8'))
            ns_ds = "http://www.w3.org/2000/09/xmldsig#"
            
            # Find signature element
            signature_elem = root.find(f".//{{{ns_ds}}}Signature")
            
            if signature_elem is None:
                return {
                    "valid": False,
                    "signed": False,
                    "message": "No digital signature found"
                }
            
            # Extract signature value
            sig_value_elem = signature_elem.find(f".//{{{ns_ds}}}SignatureValue")
            if sig_value_elem is None or not sig_value_elem.text:
                return {
                    "valid": False,
                    "signed": False,
                    "message": "Invalid signature format"
                }
            
            signature_b64 = sig_value_elem.text.strip()
            signature = base64.b64decode(signature_b64)
            
            # Get canonical XML (excluding signature)
            # Remove signature element for verification
            root_copy = etree.fromstring(xml_content.encode('utf-8'))
            sig_elem_copy = root_copy.find(f".//{{{ns_ds}}}Signature")
            if sig_elem_copy is not None:
                sig_elem_copy.getparent().remove(sig_elem_copy)
            
            canonical_xml = etree.tostring(root_copy, method='c14n')
            
            # Verify signature
            try:
                self.public_key.verify(
                    signature,
                    canonical_xml,
                    padding.PKCS1v15(),
                    hashes.SHA1()
                )
                signature_valid = True
            except Exception as e:
                logger.error(f"Signature verification failed: {e}")
                signature_valid = False
            
            return {
                "valid": signature_valid,
                "signed": True,
                "message": "Signature is valid" if signature_valid else "Signature verification failed"
            }
            
        except Exception as e:
            logger.error(f"Error verifying signature: {e}", exc_info=True)
            return {
                "valid": False,
                "signed": False,
                "message": f"Verification error: {str(e)}"
            }