export const latexOperations = [
    {
        category: "small",
        symbols: [
            { latex: "\\times " },
            { latex: "\\div " },
            { latex: "\\cdot " },
            { latex: "\\neq " },
            { latex: "\\bar{x} " },
            { latex: "\\vec{x} " },
            { latex: "\\dot{x} " },
            { latex: "\\frac{a}{b} " },
            { latex: "a^{b} " },
            { latex: "a_{b} " },
            { latex: "x_a^b " },
            { latex: "\\sqrt{x} " },
            { latex: "\\sqrt[n]{x} " },
            { latex: "\\int " },
            { latex: "\\int_{a}^{b} " },
            { latex: "\\sum_a^b " },
        ],
    },
    {
        category: "long",
        symbols: [
            { latex: "\\lim_{x \\rightarrow 0} " },
            { latex: "\\log_{a}{b} " },
            { latex: "\\sin " },
            { latex: "\\cos " },
            { latex: "\\tan " },
        ],
    },
    {
        category: "big",
        symbols: [
            { latex: "\\begin{array}{cc} a & b \\\\ c & d \\end{array} " },
            { latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} " },
            { latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} " },
            { latex: "\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix} " },
            { latex: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} " },
        ],
    },
];