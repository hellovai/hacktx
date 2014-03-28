{
    "details": "<p>Let E(<var>x</var><sub>0</sub>, <var>y</var><sub>0</sub>) be the number of steps it takes to determine the greatest common divisor of <var>x</var><sub>0</sub> and <var>y</var><sub>0</sub> with <b>Euclid's algorithm</b>. More formally:<br/><var>x</var><sub>1</sub> = <var>y</var><sub>0</sub>, <var>y</var><sub>1</sub> = <var>x</var><sub>0</sub> mod <var>y</var><sub>0</sub><br/><var>x<sub>n</sub></var> = <var>y</var><sub><var>n</var>-1</sub>, <var>y</var><sub><var>n</var></sub> = <var>x</var><sub><var>n</var>-1</sub> mod <var>y</var><sub><var>n</var>-1</sub><br/>E(<var>x</var><sub>0</sub>, <var>y</var><sub>0</sub>) is the smallest <var>n</var> such that <var>y</var><sub><var>n</var></sub> = 0.</p><p>We have E(1,1) = 1, E(10,6) = 3 and E(6,10) = 4.</p><p>Define S(N) as the sum of E(<var>x,y</var>) for 1 <img alt=\"\u2264\" border=\"0\" height=\"12\" src=\"images/symbol_le.gif\" style=\"vertical-align:middle;\" width=\"10\"/> <var>x,y</var> <img alt=\"\u2264\" border=\"0\" height=\"12\" src=\"images/symbol_le.gif\" style=\"vertical-align:middle;\" width=\"10\"/> N.<br/>We have S(1) = 1, S(10) = 221 and S(100) = 39826.</p><p>Find S(5\u00b710<sup>6</sup>).</p>",
    "folder": "steps-in-euclids-algorithm",
    "level": 1,
    "random": 0.2212550199771327,
    "tags": [],
    "title": "Steps in Euclid's algorithm"
}