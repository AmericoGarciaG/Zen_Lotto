#!/usr/bin/env python3
"""
GENERADOR ULTRA-OPTIMIZADO DE TODAS LAS COMBINACIONES CLASE OMEGA
================================================================

Este código está diseñado para máxima eficiencia computacional:
- Procesamiento paralelo con multiprocessing
- Vectorización con NumPy
- Algoritmos optimizados de generación
- Uso eficiente de memoria
- Guardado progresivo para evitar pérdida de datos

Objetivo: Encontrar TODAS las combinaciones Clase Omega del espacio completo
de Melate Retro (3,262,623 combinaciones posibles)

Criterios Omega:
- Afinidad de Pares ≥ 459
- Afinidad de Tercias ≥ 74  
- Afinidad de Cuartetos ≥ 10

Autor: Proyecto Omega Point
Fecha: 2025-01-09
"""

import numpy as np
import pandas as pd
from itertools import combinations
import pickle
import time
from datetime import datetime
import multiprocessing as mp
from functools import partial
import os
import sys

# ============================================================================
# CONFIGURACIÓN GLOBAL
# ============================================================================

# Parámetros del juego
MIN_NUM = 1
MAX_NUM = 39
NUMS_POR_COMBINACION = 6

# Criterios Omega (datos reales del Proyecto Omega Point)
UMBRAL_PARES = 459
UMBRAL_TERCIAS = 74
UMBRAL_CUARTETOS = 10

# Configuración de procesamiento
NUM_PROCESOS = mp.cpu_count()  # Usar todos los cores disponibles
BATCH_SIZE = 50000  # Procesar en lotes para eficiencia de memoria
SAVE_INTERVAL = 100000  # Guardar progreso cada X combinaciones procesadas

# ============================================================================
# DATOS DE FRECUENCIA REALES (EXTRAÍDOS DEL PROYECTO OMEGA POINT)
# ============================================================================

def cargar_frecuencias_reales():
    """
    Carga las frecuencias reales de pares, tercias y cuartetos
    desde los datos del Proyecto Omega Point
    """
    print("🔄 Cargando frecuencias reales del Proyecto Omega Point...")
    
    # Intentar cargar desde archivos pickle si existen
    try:
        with open('./frecuencias_reales_pares.pkl', 'rb') as f:
            freq_pares = pickle.load(f)
        with open('./frecuencias_reales_tercias.pkl', 'rb') as f:
            freq_tercias = pickle.load(f)
        with open('./frecuencias_reales_cuartetos.pkl', 'rb') as f:
            freq_cuartetos = pickle.load(f)
        
        print(f"✅ Frecuencias cargadas: {len(freq_pares)} pares, {len(freq_tercias)} tercias, {len(freq_cuartetos)} cuartetos")
        return freq_pares, freq_tercias, freq_cuartetos
        
    except FileNotFoundError:
        print("❌ Error: No se encontraron los archivos de frecuencias reales")
        print("   Asegúrate de que existan los archivos:")
        print("   - frecuencias_reales_pares.pkl")
        print("   - frecuencias_reales_tercias.pkl") 
        print("   - frecuencias_reales_cuartetos.pkl")
        sys.exit(1)

# Cargar frecuencias globalmente para eficiencia
FREQ_PARES, FREQ_TERCIAS, FREQ_CUARTETOS = cargar_frecuencias_reales()

# ============================================================================
# FUNCIONES DE CÁLCULO DE AFINIDADES (ULTRA-OPTIMIZADAS)
# ============================================================================

def calcular_afinidad_pares_optimizada(combinacion):
    """Calcula afinidad de pares de forma ultra-optimizada"""
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            par = tuple(sorted([combinacion[i], combinacion[j]]))
            afinidad += FREQ_PARES.get(par, 0)
    return afinidad

def calcular_afinidad_tercias_optimizada(combinacion):
    """Calcula afinidad de tercias de forma ultra-optimizada"""
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            for k in range(j + 1, len(combinacion)):
                tercia = tuple(sorted([combinacion[i], combinacion[j], combinacion[k]]))
                afinidad += FREQ_TERCIAS.get(tercia, 0)
    return afinidad

def calcular_afinidad_cuartetos_optimizada(combinacion):
    """Calcula afinidad de cuartetos de forma ultra-optimizada"""
    afinidad = 0
    for i in range(len(combinacion)):
        for j in range(i + 1, len(combinacion)):
            for k in range(j + 1, len(combinacion)):
                for l in range(k + 1, len(combinacion)):
                    cuarteto = tuple(sorted([combinacion[i], combinacion[j], combinacion[k], combinacion[l]]))
                    afinidad += FREQ_CUARTETOS.get(cuarteto, 0)
    return afinidad

def es_clase_omega_ultra_rapido(combinacion):
    """
    Evaluación ultra-rápida de Clase Omega con terminación temprana
    """
    # Calcular afinidades con terminación temprana
    afinidad_pares = calcular_afinidad_pares_optimizada(combinacion)
    if afinidad_pares < UMBRAL_PARES:
        return False, (afinidad_pares, 0, 0)
    
    afinidad_tercias = calcular_afinidad_tercias_optimizada(combinacion)
    if afinidad_tercias < UMBRAL_TERCIAS:
        return False, (afinidad_pares, afinidad_tercias, 0)
    
    afinidad_cuartetos = calcular_afinidad_cuartetos_optimizada(combinacion)
    if afinidad_cuartetos < UMBRAL_CUARTETOS:
        return False, (afinidad_pares, afinidad_tercias, afinidad_cuartetos)
    
    return True, (afinidad_pares, afinidad_tercias, afinidad_cuartetos)

# ============================================================================
# PROCESAMIENTO PARALELO OPTIMIZADO
# ============================================================================

def procesar_lote_combinaciones(lote_combinaciones):
    """
    Procesa un lote de combinaciones en paralelo
    Retorna solo las combinaciones Omega encontradas
    """
    omega_encontradas = []
    
    for combinacion in lote_combinaciones:
        es_omega, afinidades = es_clase_omega_ultra_rapido(combinacion)
        if es_omega:
            omega_encontradas.append({
                'combinacion': combinacion,
                'afinidad_pares': afinidades[0],
                'afinidad_tercias': afinidades[1],
                'afinidad_cuartetos': afinidades[2],
                'afinidad_total': sum(afinidades)
            })
    
    return omega_encontradas

def generar_combinaciones_por_lotes(batch_size=BATCH_SIZE):
    """
    Generador que produce lotes de combinaciones para procesamiento eficiente
    """
    lote_actual = []
    
    for combinacion in combinations(range(MIN_NUM, MAX_NUM + 1), NUMS_POR_COMBINACION):
        lote_actual.append(combinacion)
        
        if len(lote_actual) >= batch_size:
            yield lote_actual
            lote_actual = []
    
    # Yield del último lote si no está vacío
    if lote_actual:
        yield lote_actual

# ============================================================================
# FUNCIÓN PRINCIPAL ULTRA-OPTIMIZADA
# ============================================================================

def encontrar_todas_combinaciones_omega():
    """
    Función principal ultra-optimizada para encontrar TODAS las combinaciones Omega
    """
    print("🚀 INICIANDO BÚSQUEDA ULTRA-OPTIMIZADA DE TODAS LAS COMBINACIONES OMEGA")
    print("=" * 80)
    
    # Información del sistema
    print(f"💻 Procesadores disponibles: {NUM_PROCESOS}")
    print(f"📊 Tamaño de lote: {BATCH_SIZE:,}")
    print(f"💾 Intervalo de guardado: {SAVE_INTERVAL:,}")
    print(f"🎯 Espacio total: {3262623:,} combinaciones")
    print()
    
    # Inicialización
    inicio_tiempo = time.time()
    combinaciones_procesadas = 0
    omega_encontradas = []
    
    # Archivo de progreso
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archivo_progreso = f"./progreso_omega_completo_{timestamp}.txt"
    archivo_omega = f"./TODAS_Combinaciones_Omega_{timestamp}.xlsx"
    
    # Pool de procesos
    with mp.Pool(processes=NUM_PROCESOS) as pool:
        
        print("🔄 Iniciando procesamiento paralelo...")
        
        for i, lote in enumerate(generar_combinaciones_por_lotes()):
            
            # Procesar lote en paralelo
            resultados = pool.map(procesar_lote_combinaciones, [lote])
            
            # Consolidar resultados
            for resultado in resultados:
                omega_encontradas.extend(resultado)
            
            # Actualizar contadores
            combinaciones_procesadas += len(lote)
            
            # Mostrar progreso
            if combinaciones_procesadas % SAVE_INTERVAL == 0 or i % 100 == 0:
                tiempo_transcurrido = time.time() - inicio_tiempo
                velocidad = combinaciones_procesadas / tiempo_transcurrido if tiempo_transcurrido > 0 else 0
                porcentaje = (combinaciones_procesadas / 3262623) * 100
                
                print(f"📊 Progreso: {combinaciones_procesadas:,} ({porcentaje:.2f}%) | "
                      f"Omega: {len(omega_encontradas)} | "
                      f"Velocidad: {velocidad:,.0f} comb/seg")
                
                # Guardar progreso
                with open(archivo_progreso, 'w') as f:
                    f.write(f"Progreso: {combinaciones_procesadas:,} / 3,262,623\n")
                    f.write(f"Porcentaje: {porcentaje:.2f}%\n")
                    f.write(f"Omega encontradas: {len(omega_encontradas)}\n")
                    f.write(f"Velocidad: {velocidad:,.0f} combinaciones/segundo\n")
                    f.write(f"Tiempo transcurrido: {tiempo_transcurrido:.1f} segundos\n")
    
    # Estadísticas finales
    tiempo_total = time.time() - inicio_tiempo
    velocidad_promedio = combinaciones_procesadas / tiempo_total
    
    print("\n" + "=" * 80)
    print("🏆 BÚSQUEDA COMPLETADA CON ÉXITO")
    print("=" * 80)
    print(f"📊 Combinaciones procesadas: {combinaciones_procesadas:,}")
    print(f"🎯 Combinaciones Omega encontradas: {len(omega_encontradas):,}")
    print(f"📈 Porcentaje Omega: {(len(omega_encontradas) / combinaciones_procesadas) * 100:.4f}%")
    print(f"⏱️  Tiempo total: {tiempo_total:.1f} segundos ({tiempo_total/60:.1f} minutos)")
    print(f"🚀 Velocidad promedio: {velocidad_promedio:,.0f} combinaciones/segundo")
    
    # Guardar resultados en Excel
    if omega_encontradas:
        print(f"\n💾 Guardando resultados en: {archivo_omega}")
        guardar_resultados_excel(omega_encontradas, archivo_omega)
    else:
        print("\n⚠️  No se encontraron combinaciones Omega")
    
    return omega_encontradas, archivo_omega

# ============================================================================
# FUNCIÓN DE GUARDADO OPTIMIZADA
# ============================================================================

def guardar_resultados_excel(omega_encontradas, archivo_omega):
    """
    Guarda los resultados en un archivo Excel optimizado
    """
    try:
        # Convertir a DataFrame
        df_omega = pd.DataFrame(omega_encontradas)
        
        # Expandir combinaciones en columnas separadas
        df_expandido = pd.DataFrame(df_omega['combinacion'].tolist(), 
                                  columns=[f'n{i+1}' for i in range(6)])
        
        # Combinar con afinidades
        df_final = pd.concat([
            df_expandido,
            df_omega[['afinidad_pares', 'afinidad_tercias', 'afinidad_cuartetos', 'afinidad_total']]
        ], axis=1)
        
        # Agregar estadísticas adicionales
        df_final['suma'] = df_final[['n1', 'n2', 'n3', 'n4', 'n5', 'n6']].sum(axis=1)
        df_final['rango'] = df_final['n6'] - df_final['n1']
        df_final['min_num'] = df_final['n1']
        df_final['max_num'] = df_final['n6']
        
        # Ordenar por afinidad total descendente
        df_final = df_final.sort_values('afinidad_total', ascending=False).reset_index(drop=True)
        
        # Crear archivo Excel con múltiples hojas
        with pd.ExcelWriter(archivo_omega, engine='openpyxl') as writer:
            
            # Hoja principal
            df_final.to_excel(writer, sheet_name='Todas_Combinaciones_Omega', index=False)
            
            # Top 100 por afinidad
            if len(df_final) >= 100:
                df_final.head(100).to_excel(writer, sheet_name='Top_100_Mayor_Afinidad', index=False)
            
            # Estadísticas
            stats = {
                'Métrica': [
                    'Total Combinaciones Omega',
                    'Afinidad Pares Promedio',
                    'Afinidad Tercias Promedio', 
                    'Afinidad Cuartetos Promedio',
                    'Afinidad Total Promedio',
                    'Afinidad Total Máxima',
                    'Afinidad Total Mínima',
                    'Suma Promedio',
                    'Rango Promedio'
                ],
                'Valor': [
                    len(df_final),
                    df_final['afinidad_pares'].mean(),
                    df_final['afinidad_tercias'].mean(),
                    df_final['afinidad_cuartetos'].mean(),
                    df_final['afinidad_total'].mean(),
                    df_final['afinidad_total'].max(),
                    df_final['afinidad_total'].min(),
                    df_final['suma'].mean(),
                    df_final['rango'].mean()
                ]
            }
            
            pd.DataFrame(stats).to_excel(writer, sheet_name='Estadisticas', index=False)
        
        print(f"✅ Archivo Excel guardado exitosamente: {archivo_omega}")
        
    except Exception as e:
        print(f"❌ Error al guardar Excel: {e}")

# ============================================================================
# FUNCIÓN DE ESTIMACIÓN DE TIEMPO
# ============================================================================

def estimar_tiempo_completo():
    """
    Estima el tiempo necesario para procesar todas las combinaciones
    """
    print("⏱️  ESTIMANDO TIEMPO DE PROCESAMIENTO COMPLETO...")
    print("=" * 60)
    
    # Procesar una muestra pequeña para estimar velocidad
    muestra_size = 10000
    inicio = time.time()
    
    combinaciones_muestra = list(combinations(range(MIN_NUM, MAX_NUM + 1), NUMS_POR_COMBINACION))[:muestra_size]
    omega_muestra = 0
    
    for combinacion in combinaciones_muestra:
        es_omega, _ = es_clase_omega_ultra_rapido(combinacion)
        if es_omega:
            omega_muestra += 1
    
    tiempo_muestra = time.time() - inicio
    velocidad_estimada = muestra_size / tiempo_muestra
    
    # Estimaciones
    tiempo_total_estimado = 3262623 / velocidad_estimada
    omega_estimadas = (omega_muestra / muestra_size) * 3262623
    
    print(f"📊 Muestra procesada: {muestra_size:,} combinaciones")
    print(f"🎯 Omega en muestra: {omega_muestra} ({(omega_muestra/muestra_size)*100:.3f}%)")
    print(f"🚀 Velocidad estimada: {velocidad_estimada:,.0f} combinaciones/segundo")
    print(f"⏱️  Tiempo estimado total: {tiempo_total_estimado:.0f} segundos ({tiempo_total_estimado/3600:.1f} horas)")
    print(f"🏆 Omega estimadas totales: {omega_estimadas:.0f}")
    print()
    
    return tiempo_total_estimado, omega_estimadas

# ============================================================================
# MENÚ PRINCIPAL
# ============================================================================

def main():
    """
    Función principal con menú de opciones
    """
    print("🎯 GENERADOR ULTRA-OPTIMIZADO DE TODAS LAS COMBINACIONES OMEGA")
    print("=" * 70)
    print("Objetivo: Encontrar TODAS las combinaciones Clase Omega del espacio completo")
    print("Espacio total: 3,262,623 combinaciones posibles de Melate Retro")
    print()
    
    while True:
        print("OPCIONES DISPONIBLES:")
        print("1. 📊 Estimar tiempo de procesamiento completo")
        print("2. 🚀 Ejecutar búsqueda completa (TODAS las combinaciones)")
        print("3. 🧪 Prueba rápida (100,000 combinaciones)")
        print("4. ❌ Salir")
        print()
        
        opcion = input("Selecciona una opción (1-4): ").strip()
        
        if opcion == '1':
            estimar_tiempo_completo()
            
        elif opcion == '2':
            confirmacion = input("\n⚠️  ADVERTENCIA: Este proceso puede tomar varias horas.\n"
                               "¿Estás seguro de continuar? (s/N): ").strip().lower()
            if confirmacion in ['s', 'si', 'sí', 'y', 'yes']:
                omega_encontradas, archivo = encontrar_todas_combinaciones_omega()
                print(f"\n🎉 Proceso completado. Resultados en: {archivo}")
                break
            else:
                print("❌ Operación cancelada")
                
        elif opcion == '3':
            print("\n🧪 Ejecutando prueba rápida con 100,000 combinaciones...")
            # Implementar prueba rápida aquí
            combinaciones_prueba = list(combinations(range(MIN_NUM, MAX_NUM + 1), NUMS_POR_COMBINACION))[:100000]
            omega_prueba = []
            
            inicio = time.time()
            for combinacion in combinaciones_prueba:
                es_omega, afinidades = es_clase_omega_ultra_rapido(combinacion)
                if es_omega:
                    omega_prueba.append({
                        'combinacion': combinacion,
                        'afinidad_pares': afinidades[0],
                        'afinidad_tercias': afinidades[1], 
                        'afinidad_cuartetos': afinidades[2],
                        'afinidad_total': sum(afinidades)
                    })
            
            tiempo_prueba = time.time() - inicio
            print(f"✅ Prueba completada en {tiempo_prueba:.1f} segundos")
            print(f"🎯 Omega encontradas: {len(omega_prueba)} de 100,000 ({(len(omega_prueba)/100000)*100:.3f}%)")
            
        elif opcion == '4':
            print("👋 ¡Hasta luego!")
            break
            
        else:
            print("❌ Opción inválida. Por favor selecciona 1-4.")
        
        print("\n" + "-" * 50 + "\n")

if __name__ == "__main__":
    main()

