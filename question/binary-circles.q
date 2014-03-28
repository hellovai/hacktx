{
    "details": "<p>2<sup>N</sup> binary digits can be placed in a circle so that all the N-digit clockwise subsequences are distinct.</p><p>For N=3, two such circular arrangements are possible, ignoring rotations:</p><div align=\"center\"><img src=\"project/images/p_265_BinaryCircles.gif\"/></div><p>For the first arrangement, the 3-digit subsequences, in clockwise order, are:<br/> 000, 001, 010, 101, 011, 111, 110 and 100.</p><p>Each circular arrangement can be encoded as a number by concatenating the binary digits starting with the subsequence of all zeros as the most significant bits and proceeding clockwise. The two arrangements for N=3 are thus represented as 23 and 29:<div align=\"center\">00010111\u2009<sub>2</sub> = 23</div><div align=\"center\">00011101\u2009<sub>2</sub> = 29</div></p><p>Calling S(N) the sum of the unique numeric representations, we can see that S(3) = 23 + 29 = 52.</p><p>Find S(5).</p>",
    "folder": "binary-circles",
    "level": 1,
    "random": 0.3422546505012344,
    "tags": [],
    "title": "Binary Circles"
}