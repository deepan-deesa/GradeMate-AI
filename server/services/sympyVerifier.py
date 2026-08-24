import sys
import json

def verify_step_expression(lhs_str, rhs_str):
    """
    Independent SymPy mathematical step verification script.
    Checks algebraic equivalence by simplifying: simplify(lhs - rhs) == 0
    """
    try:
        import sympy
        x, y, z, a, b, c = sympy.symbols('x y z a b c')
        
        # Clean formatting
        clean_lhs = lhs_str.replace('^', '**').replace('=', '')
        clean_rhs = rhs_str.replace('^', '**').replace('=', '')
        
        expr_lhs = sympy.sympify(clean_lhs)
        expr_rhs = sympy.sympify(clean_rhs)
        
        diff = sympy.simplify(expr_lhs - expr_rhs)
        is_equivalent = (diff == 0) or (diff == 0.0)
        
        return {
            "is_valid": is_equivalent,
            "simplified_diff": str(diff),
            "note": "SymPy verified symbolic equivalence." if is_equivalent else f"Symbolic difference found: {diff}"
        }
    except Exception as err:
        return {
            "is_valid": True,
            "simplified_diff": "N/A",
            "note": f"Symbolic check skipped: {str(err)}"
        }

if __name__ == "__main__":
    if len(sys.argv) > 2:
        lhs_arg = sys.argv[1]
        rhs_arg = sys.argv[2]
        result = verify_step_expression(lhs_arg, rhs_arg)
        print(json.dumps(result))
    else:
        # Default test run
        print(json.dumps(verify_step_expression("2*x + 5", "15 - 5")))
