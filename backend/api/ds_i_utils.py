import re

# Dictionary
prefixes = {
    "da": "\\deca",
    "h": "\\hecto",
    "k": "\\kilo",
    "M": "\\mega",
    "G": "\\giga",
    "T": "\\tera",
    "P": "\\peta",
    "E": "\\exa",
    "Z": "\\zetta",
    "Y": "\\yotta",
    "R": "\\ronna",
    "Q": "\\quetta",
    "d": "\\deci",
    "c": "\\centi",
    "m": "\\milli",
    "μ": "\\micro", # Greek Small Letter Mu
    "µ": "\\micro", # Micro Sign
    "n": "\\nano",
    "p": "\\pico",
    "f": "\\femto",
    "a": "\\atto",
    "z": "\\zepto",
    "y": "\\yocto",
    "r": "\\ronto",
    "q": "\\quecto"
}

binary_prefixes = {
    "Ki": "\\kibi",
    "Mi": "\\mebi",
    "Gi": "\\gibi",
    "Ti": "\\tebi",
    "Pi": "\\pebi",
    "Ei": "\\exbi",
    "Zi": "\\zebi",
    "Yi": "\\yobi",
}

base_units = {
    "m": "\\metre",
    "kg": "\\kilogram",
    "s": "\\second",
    "A": "\\ampere",
    "K": "\\kelvin",
    "mol": "\\mole",
    "cd": "\\candela",
    "1": "\\one",
    "d": "\\day",
    "h": "\\hour",
    "min": "\\minute",
    "°": "\\degree",
    "‘": "\\arcminute",
    "'": "\\arcminute",
    "“": "\\arcsecond",
    "''": "\\arcsecond",
    "g": "\\gram",
    "rad": "\\radian",
    "sr": "\\steradian",
    "Hz": "\\hertz",
    "N": "\\newton",
    "Pa": "\\pascal",
    "J": "\\joule",
    "W": "\\watt",
    "C": "\\coulomb",
    "V": "\\volt",
    "F": "\\farad",
    "Ω": "\\ohm",
    "S": "\\siemens",
    "Wb": "\\weber",
    "T": "\\tesla",
    "H": "\\henry",
    "°C": "\\degreecelsius",
    "lm": "\\lumen",
    "lx": "\\lux",
    "Bq": "\\becquerel",
    "Sv": "\\sievert",
    "Gy": "\\gray",
    "kat": "\\katal",
    "bit": "\\bit",
    "B": "\\byte",
    "ppm": "\\ppm",
    "%": "\\percent",
    "ha": "\\hectare",
    "l": "\\litre",
    "t": "\\tonne",
    "eV": "\\electronvolt",
    "Da": "\\dalton",
    "au": "\\astronomicalunit",
    "Np": "\\neper",
    "B": "\\bel",
    "dB": "\\decibel",
    "bar": "\\bar",
    "mmHg": "\\mmHg",
    "Å": "\\angstrom",
    "M": "\\nauticalmile",
    "b": "\\barn",
    "kn": "\\knot",
    "erg": "\\erg",
    "dyn": "\\dyne",
    "P": "\\poise",
    "ST": "\\stokes",
    "sb": "\\stilb",
    "ph": "\\phot",
    "Gal": "\\gal",
    "Mx": "\\maxwell",
    "G": "\\gauss",
    "Oe": "\\oersted"
}

def parse_token(token, power_sign=1):
    """ Mengubah token unit dengan prefix dan exponent ke format DS-I. """
    match = re.fullmatch(r"([^\d\*\./]+)(-?\d*(?:\.\d+)?)", token)
    if not match:
        return token

    unit_part, exp_str = match.groups()
    exp = float(exp_str) if exp_str else 1
    exp *= power_sign

    # Cek binary prefix
    for p in sorted(binary_prefixes, key=len, reverse=True):
        if unit_part.startswith(p):
            base = unit_part[len(p):]
            if base == "bit":
                unit_str = f"{binary_prefixes[p]}\\bit"
                return unit_str + (f"\\tothe{{{exp}}}" if exp != 1 else "")
            elif base == "B":
                unit_str = f"{binary_prefixes[p]}\\byte"
                return unit_str + (f"\\tothe{{{exp}}}" if exp != 1 else "")
            return token 

    # Cek prefix SI
    for p in sorted(prefixes, key=len, reverse=True):
        if unit_part.startswith(p):
            base = unit_part[len(p):]
            if base in base_units:
                unit_str = prefixes[p] + base_units[base]
                # format exponent: integer tanpa titik, desimal tetap
                if isinstance(exp, float) and exp.is_integer():
                    exp_formatted = int(exp)
                else:
                    exp_formatted = exp
                return unit_str + (f"\\tothe{{{exp_formatted}}}" if exp != 1 else "")

    # Base unit saja
    if unit_part in base_units:
        unit_str = base_units[unit_part]
        if isinstance(exp, float) and exp.is_integer():
            exp_formatted = int(exp)
        else:
            exp_formatted = exp
        return unit_str + (f"\\tothe{{{exp_formatted}}}" if exp != 1 else "")

    return token

def d_si(expr: str) -> str:
    """ Fungsi utama konversi string unit ke format DS-I. Mendukung operator perkalian '.', '*', dan pembagian '/'."""
    expr = expr.replace(" ", "").replace(".", "*")
    if "/" in expr:
        num, denom = expr.split("/", 1)
        numerator_tokens = re.split(r"\*", num)
        denominator_tokens = re.split(r"\*", denom)
    else:
        numerator_tokens = re.split(r"\*", expr)
        denominator_tokens = []

    latex_parts = []
    for token in numerator_tokens:
        if token:
            latex_parts.append(parse_token(token, 1))
    for token in denominator_tokens:
        if token:
            latex_parts.append(parse_token(token, -1))

    return "".join(latex_parts)

def convert_unit(unit):
    """Convert LaTeX or DS-I unit format to human-readable format."""
    
    all_units = list(base_units.items()) + list(prefixes.items()) + list(binary_prefixes.items())
    
    # Ganti unit dasar sesuai dengan yang ada di dictionary (urutkan agar yang lebih spesifik terlebih dahulu)
    for base_unit, latex_unit in sorted(base_units.items(), key=lambda item: len(item[1]), reverse=True):
        if latex_unit in unit:
            unit = unit.replace(latex_unit, base_unit)  # Ganti unit dasar dengan unit standar
    
    # Ganti prefix sesuai dengan yang ada di dictionary
    for prefix, latex_prefix in prefixes.items():
        if latex_prefix in unit:
            unit = unit.replace(latex_prefix, prefix)
    
    # Mengganti binary prefix
    for binary_prefix, latex_binary_prefix in binary_prefixes.items():
        if latex_binary_prefix in unit:
            unit = unit.replace(latex_binary_prefix, binary_prefix)  

    # Menangani \tothe dan simbol lainnya
    if "\\tothe" in unit:
        unit = unit.replace("\\tothe", "^")
        unit = unit.replace("}", "")  
        unit = unit.replace("{", "") 
    
    return unit

def convert_latex_unit(latex_unit):
    import re

    # Tokenize LaTeX string: separate prefixes, units, exponents, etc.
    tokens = re.findall(r'\\[a-zA-Z]+|\{[^}]+\}', latex_unit)

    units = []
    i = 0
    while i < len(tokens):
        token = tokens[i]

        # Handle exponent: \tothe + {exponent}
        if token == '\\tothe' and i + 1 < len(tokens):
            exponent = tokens[i + 1].strip("{}")
            if exponent == '-1':
                if units:
                    units[-1] = f"/{units[-1]}"  # Divide for -1 exponent
            else:
                if units:
                    units[-1] = f"{units[-1]}<sup>{exponent}</sup>"  # Apply exponent
            i += 2
            continue

        # Handle prefix + base unit
        if i + 1 < len(tokens):
            prefix_token = tokens[i]
            unit_token = tokens[i + 1]
            prefix = next((k for k, v in prefixes.items() if v == prefix_token), None)
            base = next((k for k, v in base_units.items() if v == unit_token), None)
            if prefix and base:
                units.append(prefix + base)  # Combine prefix + unit
                i += 2
                continue

        # Handle base unit without prefix
        base = next((k for k, v in base_units.items() if v == token), None)
        if base:
            units.append(base)
            i += 1
        else:
            # If unmatched, just append the token (e.g., keep unknown)
            units.append(token)
            i += 1

    # Now handle the final output
    result = ''.join(units)

    # Clean up extra parts like backslashes or curly braces
    result = result.replace("\\", "")  # Remove LaTeX backslashes
    result = result.replace("{", "").replace("}", "")  # Remove curly braces

    return result