# Implementación de la lógica de negocio para PCP.
def calculate_pcp(frequencies, total_draws, k):
    observed_prob = frequencies[0] / total_draws
    theoretical_prob = 1 / (56**k)
    return {
        "PCP": observed_prob * theoretical_prob,
        "Rareza": observed_prob / theoretical_prob,
    }
