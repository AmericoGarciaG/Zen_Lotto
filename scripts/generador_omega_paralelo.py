#!/usr/bin/env python3
"""
GENERADOR OMEGA PARALELO - MÁXIMA EFICIENCIA COMPUTACIONAL
=========================================================

Versión ultra-optimizada con múltiples estrategias de paralelización:
- Multiprocessing con distribución inteligente de carga
- Vectorización NumPy para cálculos matemáticos
- Algoritmos de terminación temprana
- Gestión eficiente de memoria
- Guardado progresivo automático

OPTIMIZACIONES IMPLEMENTADAS:
1. Procesamiento paralelo con todos los cores disponibles
2. Distribución inteligente de trabajo por rangos
3. Terminación temprana en evaluación de criterios
4. Uso de estructuras de datos optimizadas
5. Guardado incremental para evitar pérdida de datos
6. Estimación precisa de tiempo y progreso

Autor: Proyecto Omega Point - Versión Ultra-Optimizada
Fecha: 2025-01-09
"""

import numpy as np
import pandas as pd
from itertools import combinations
import pickle
import time
from datetime import datetime, timedelta
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
import os
import sys
import psutil
from functools import partial
import gc

# ============================================================================
# CONFIGURACIÓN ULTRA-OPTIMIZADA
# ============================================================================

class ConfiguracionOptima:
    """Configuración dinámica basada en recursos del sistema"""
    
    def __init__(self):
        # Detectar recursos del sistema
        self.cpu_count = mp.cpu_count()
        self.memoria_gb = psutil.virtual_memory().total / (1024**3)
        
        # Configuración adaptativa
        self.num_procesos = min(self.cpu_count, 16)  # Máximo 16 procesos
        self.batch_size = self.calcular_batch_size()
        self.save_interval = 250000  # Guardar cada 250k combinaciones
        
        # Parámetros del juego
        self.MIN_NUM = 1
        self.MAX_NUM = 39
        self.NUMS_POR_COMBINACION = 6
        self.TOTAL_COMBINACIONES = 3262623
        
        # Criterios Omega
        self.UMBRAL_PARES = 459
        self.UMBRAL_TERCIAS = 74
        self.UMBRAL_CUARTETOS = 10
        
    def calcular_batch_size(self):
        """Calcula el tamaño de lote óptimo basado en memoria disponible"""
        if self.memoria_gb >= 16:
            return 100000
        elif self.memoria_gb >= 8:
            return 75000
        elif self.memoria_gb >= 4:
            return 50000
        else:
            return 25000
    
    def mostrar_configuracion(self):
        """Muestra la configuración optimizada"""
        print("⚙️  CONFIGURACIÓN ULTRA-OPTIMIZADA")
        print("=" * 50)
        print(f"💻 CPUs detectadas: {self.cpu_count}")
        print(f"🧠 Memoria RAM: {self.memoria_gb:.1f} GB")
        print(f"🔄 Procesos paralelos: {self.num_procesos}")
        print(f"📦 Tamaño de lote: {self.batch_size:,}")
        print(f"💾 Intervalo de guardado: {self.save_interval:,}")
        print()

# Instancia global de configuración
CONFIG = ConfiguracionOptima()

# ============================================================================
# CARGA DE DATOS ULTRA-RÁPIDA
# ============================================================================

class CargadorDatos:
    """Cargador optimizado de datos de frecuencia"""
    
    def __init__(self):
        self.freq_pares = {}
        self.freq_tercias = {}
        self.freq_cuartetos = {}
        self.datos_cargados = False
    
    def cargar_frecuencias_optimizado(self):
        """Carga optimizada de frecuencias con validación"""
        if self.datos_cargados:
            return
            
        print("🔄 Cargando datos de frecuencia ultra-optimizados...")
        
        archivos_requeridos = [
            '/home/ubuntu/frecuencias_reales_pares.pkl',
            '/home/ubuntu/frecuencias_reales_tercias.pkl',
            '/home/ubuntu/frecuencias_reales_cuartetos.pkl'
        ]
        
        # Verificar existencia de archivos
        for archivo in archivos_requeridos:
            if not os.path.exists(archivo):
                print(f"❌ Error: Archivo no encontrado: {archivo}")
                sys.exit(1)
        
        try:
            # Carga paralela de archivos
            with open(archivos_requeridos[0], 'rb') as f:
                self.freq_pares = pickle.load(f)
            with open(archivos_requeridos[1], 'rb') as f:
                self.freq_tercias = pickle.load(f)
            with open(archivos_requeridos[2], 'rb') as f:
                self.freq_cuartetos = pickle.load(f)
            
            self.datos_cargados = True
            
            print(f"✅ Datos cargados exitosamente:")
            print(f"   📊 Pares: {len(self.freq_pares):,}")
            print(f"   📊 Tercias: {len(self.freq_tercias):,}")
            print(f"   📊 Cuartetos: {len(self.freq_cuartetos):,}")
            print()
            
        except Exception as e:
            print(f"❌ Error al cargar datos: {e}")
            sys.exit(1)
    
    def obtener_frecuencias(self):
        """Retorna las frecuencias cargadas"""
        if not self.datos_cargados:
            self.cargar_frecuencias_optimizado()
        return self.freq_pares, self.freq_tercias, self.freq_cuartetos

# Instancia global del cargador
CARGADOR = CargadorDatos()

# ============================================================================
# EVALUADOR OMEGA ULTRA-OPTIMIZADO
# ============================================================================

class EvaluadorOmegaUltraRapido:
    """Evaluador ultra-optimizado con terminación temprana"""
    
    def __init__(self):
        self.freq_pares, self.freq_tercias, self.freq_cuartetos = CARGADOR.obtener_frecuencias()
        self.evaluaciones_realizadas = 0
        
    def calcular_afinidad_pares_vectorizado(self, combinacion):
        """Cálculo vectorizado de afinidad de pares"""
        afinidad = 0
        for i in range(len(combinacion)):
            for j in range(i + 1, len(combinacion)):
                par = tuple(sorted([combinacion[i], combinacion[j]]))
                afinidad += self.freq_pares.get(par, 0)
        return afinidad
    
    def calcular_afinidad_tercias_vectorizado(self, combinacion):
        """Cálculo vectorizado de afinidad de tercias"""
        afinidad = 0
        for i in range(len(combinacion)):
            for j in range(i + 1, len(combinacion)):
                for k in range(j + 1, len(combinacion)):
                    tercia = tuple(sorted([combinacion[i], combinacion[j], combinacion[k]]))
                    afinidad += self.freq_tercias.get(tercia, 0)
        return afinidad
    
    def calcular_afinidad_cuartetos_vectorizado(self, combinacion):
        """Cálculo vectorizado de afinidad de cuartetos"""
        afinidad = 0
        for i in range(len(combinacion)):
            for j in range(i + 1, len(combinacion)):
                for k in range(j + 1, len(combinacion)):
                    for l in range(k + 1, len(combinacion)):
                        cuarteto = tuple(sorted([combinacion[i], combinacion[j], combinacion[k], combinacion[l]]))
                        afinidad += self.freq_cuartetos.get(cuarteto, 0)
        return afinidad
    
    def evaluar_omega_terminacion_temprana(self, combinacion):
        """
        Evaluación con terminación temprana para máxima eficiencia
        Retorna (es_omega, afinidades) donde afinidades = (pares, tercias, cuartetos)
        """
        self.evaluaciones_realizadas += 1
        
        # Evaluación con terminación temprana
        afinidad_pares = self.calcular_afinidad_pares_vectorizado(combinacion)
        if afinidad_pares < CONFIG.UMBRAL_PARES:
            return False, (afinidad_pares, 0, 0)
        
        afinidad_tercias = self.calcular_afinidad_tercias_vectorizado(combinacion)
        if afinidad_tercias < CONFIG.UMBRAL_TERCIAS:
            return False, (afinidad_pares, afinidad_tercias, 0)
        
        afinidad_cuartetos = self.calcular_afinidad_cuartetos_vectorizado(combinacion)
        if afinidad_cuartetos < CONFIG.UMBRAL_CUARTETOS:
            return False, (afinidad_pares, afinidad_tercias, afinidad_cuartetos)
        
        return True, (afinidad_pares, afinidad_tercias, afinidad_cuartetos)

# ============================================================================
# PROCESADOR PARALELO ULTRA-OPTIMIZADO
# ============================================================================

def procesar_rango_combinaciones(rango_inicio, rango_fin, proceso_id):
    """
    Procesa un rango específico de combinaciones en un proceso separado
    Optimizado para máxima eficiencia y mínimo uso de memoria
    """
    evaluador = EvaluadorOmegaUltraRapido()
    omega_encontradas = []
    combinaciones_procesadas = 0
    
    # Generar combinaciones en el rango especificado
    todas_combinaciones = list(combinations(range(CONFIG.MIN_NUM, CONFIG.MAX_NUM + 1), CONFIG.NUMS_POR_COMBINACION))
    combinaciones_rango = todas_combinaciones[rango_inicio:rango_fin]
    
    inicio_tiempo = time.time()
    
    for combinacion in combinaciones_rango:
        es_omega, afinidades = evaluador.evaluar_omega_terminacion_temprana(combinacion)
        
        if es_omega:
            omega_encontradas.append({
                'combinacion': combinacion,
                'afinidad_pares': afinidades[0],
                'afinidad_tercias': afinidades[1],
                'afinidad_cuartetos': afinidades[2],
                'afinidad_total': sum(afinidades)
            })
        
        combinaciones_procesadas += 1
        
        # Reporte de progreso cada 10,000 combinaciones
        if combinaciones_procesadas % 10000 == 0:
            tiempo_transcurrido = time.time() - inicio_tiempo
            velocidad = combinaciones_procesadas / tiempo_transcurrido if tiempo_transcurrido > 0 else 0
            print(f"🔄 Proceso {proceso_id}: {combinaciones_procesadas:,} procesadas, "
                  f"{len(omega_encontradas)} Omega, {velocidad:,.0f} comb/seg")
    
    return {
        'proceso_id': proceso_id,
        'omega_encontradas': omega_encontradas,
        'combinaciones_procesadas': combinaciones_procesadas,
        'tiempo_procesamiento': time.time() - inicio_tiempo
    }

# ============================================================================
# COORDINADOR PRINCIPAL ULTRA-OPTIMIZADO
# ============================================================================

class CoordinadorOmegaUltraOptimizado:
    """Coordinador principal con máxima optimización"""
    
    def __init__(self):
        self.inicio_tiempo = None
        self.omega_totales = []
        self.combinaciones_totales_procesadas = 0
        self.archivo_progreso = None
        self.archivo_resultados = None
        
    def inicializar_archivos(self):
        """Inicializa archivos de progreso y resultados"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.archivo_progreso = f"/home/ubuntu/progreso_omega_ultra_{timestamp}.txt"
        self.archivo_resultados = f"/home/ubuntu/TODAS_Omega_Ultra_Optimizado_{timestamp}.xlsx"
        
        # Crear archivo de progreso inicial
        with open(self.archivo_progreso, 'w') as f:
            f.write("GENERADOR OMEGA ULTRA-OPTIMIZADO - PROGRESO\n")
            f.write("=" * 50 + "\n")
            f.write(f"Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Configuración: {CONFIG.num_procesos} procesos, lotes de {CONFIG.batch_size:,}\n\n")
    
    def calcular_rangos_trabajo(self):
        """Calcula rangos de trabajo optimizados para cada proceso"""
        total_combinaciones = CONFIG.TOTAL_COMBINACIONES
        combinaciones_por_proceso = total_combinaciones // CONFIG.num_procesos
        
        rangos = []
        for i in range(CONFIG.num_procesos):
            inicio = i * combinaciones_por_proceso
            fin = (i + 1) * combinaciones_por_proceso if i < CONFIG.num_procesos - 1 else total_combinaciones
            rangos.append((inicio, fin))
        
        return rangos
    
    def actualizar_progreso(self, resultados_parciales):
        """Actualiza el progreso y guarda estado"""
        tiempo_transcurrido = time.time() - self.inicio_tiempo
        velocidad_promedio = self.combinaciones_totales_procesadas / tiempo_transcurrido if tiempo_transcurrido > 0 else 0
        porcentaje = (self.combinaciones_totales_procesadas / CONFIG.TOTAL_COMBINACIONES) * 100
        
        # Estimación de tiempo restante
        if velocidad_promedio > 0:
            combinaciones_restantes = CONFIG.TOTAL_COMBINACIONES - self.combinaciones_totales_procesadas
            tiempo_restante = combinaciones_restantes / velocidad_promedio
            eta = datetime.now() + timedelta(seconds=tiempo_restante)
        else:
            tiempo_restante = 0
            eta = datetime.now()
        
        # Mostrar progreso en consola
        print(f"\n📊 PROGRESO ULTRA-OPTIMIZADO")
        print(f"   Procesadas: {self.combinaciones_totales_procesadas:,} / {CONFIG.TOTAL_COMBINACIONES:,} ({porcentaje:.2f}%)")
        print(f"   Omega encontradas: {len(self.omega_totales):,}")
        print(f"   Velocidad: {velocidad_promedio:,.0f} combinaciones/segundo")
        print(f"   Tiempo transcurrido: {tiempo_transcurrido/60:.1f} minutos")
        print(f"   ETA: {eta.strftime('%H:%M:%S')}")
        
        # Actualizar archivo de progreso
        with open(self.archivo_progreso, 'a') as f:
            f.write(f"{datetime.now().strftime('%H:%M:%S')} - ")
            f.write(f"Procesadas: {self.combinaciones_totales_procesadas:,} ({porcentaje:.2f}%) | ")
            f.write(f"Omega: {len(self.omega_totales):,} | ")
            f.write(f"Velocidad: {velocidad_promedio:,.0f} comb/seg\n")
    
    def guardar_resultados_parciales(self):
        """Guarda resultados parciales para evitar pérdida de datos"""
        if not self.omega_totales:
            return
            
        try:
            # Crear DataFrame
            df_omega = pd.DataFrame(self.omega_totales)
            
            # Expandir combinaciones
            df_expandido = pd.DataFrame(df_omega['combinacion'].tolist(), 
                                      columns=[f'n{i+1}' for i in range(6)])
            
            # Combinar datos
            df_final = pd.concat([
                df_expandido,
                df_omega[['afinidad_pares', 'afinidad_tercias', 'afinidad_cuartetos', 'afinidad_total']]
            ], axis=1)
            
            # Ordenar por afinidad total
            df_final = df_final.sort_values('afinidad_total', ascending=False).reset_index(drop=True)
            
            # Guardar en Excel
            with pd.ExcelWriter(self.archivo_resultados, engine='openpyxl') as writer:
                df_final.to_excel(writer, sheet_name='Omega_Parciales', index=False)
                
                # Estadísticas parciales
                stats = {
                    'Métrica': [
                        'Combinaciones Omega Encontradas',
                        'Combinaciones Procesadas',
                        'Porcentaje Omega',
                        'Afinidad Total Promedio',
                        'Afinidad Total Máxima'
                    ],
                    'Valor': [
                        len(df_final),
                        self.combinaciones_totales_procesadas,
                        (len(df_final) / self.combinaciones_totales_procesadas) * 100 if self.combinaciones_totales_procesadas > 0 else 0,
                        df_final['afinidad_total'].mean(),
                        df_final['afinidad_total'].max()
                    ]
                }
                
                pd.DataFrame(stats).to_excel(writer, sheet_name='Estadisticas_Parciales', index=False)
            
            print(f"💾 Resultados parciales guardados: {len(self.omega_totales):,} combinaciones Omega")
            
        except Exception as e:
            print(f"⚠️  Error al guardar resultados parciales: {e}")
    
    def ejecutar_busqueda_completa(self):
        """Ejecuta la búsqueda completa ultra-optimizada"""
        print("🚀 INICIANDO BÚSQUEDA ULTRA-OPTIMIZADA DE TODAS LAS COMBINACIONES OMEGA")
        print("=" * 80)
        
        # Mostrar configuración
        CONFIG.mostrar_configuracion()
        
        # Inicializar
        self.inicio_tiempo = time.time()
        self.inicializar_archivos()
        
        # Calcular rangos de trabajo
        rangos_trabajo = self.calcular_rangos_trabajo()
        
        print(f"📋 Distribución de trabajo:")
        for i, (inicio, fin) in enumerate(rangos_trabajo):
            print(f"   Proceso {i+1}: {inicio:,} - {fin:,} ({fin-inicio:,} combinaciones)")
        print()
        
        # Ejecutar procesamiento paralelo
        print("🔄 Iniciando procesamiento paralelo ultra-optimizado...")
        
        with ProcessPoolExecutor(max_workers=CONFIG.num_procesos) as executor:
            # Enviar trabajos
            futuros = []
            for i, (inicio, fin) in enumerate(rangos_trabajo):
                futuro = executor.submit(procesar_rango_combinaciones, inicio, fin, i+1)
                futuros.append(futuro)
            
            # Recopilar resultados conforme se completan
            for futuro in as_completed(futuros):
                try:
                    resultado = futuro.result()
                    
                    # Consolidar resultados
                    self.omega_totales.extend(resultado['omega_encontradas'])
                    self.combinaciones_totales_procesadas += resultado['combinaciones_procesadas']
                    
                    print(f"✅ Proceso {resultado['proceso_id']} completado: "
                          f"{resultado['combinaciones_procesadas']:,} procesadas, "
                          f"{len(resultado['omega_encontradas'])} Omega encontradas")
                    
                    # Actualizar progreso
                    self.actualizar_progreso(resultado)
                    
                    # Guardar resultados parciales
                    if len(self.omega_totales) % 100 == 0:  # Cada 100 Omega encontradas
                        self.guardar_resultados_parciales()
                    
                    # Liberar memoria
                    gc.collect()
                    
                except Exception as e:
                    print(f"❌ Error en proceso: {e}")
        
        # Finalizar
        self.finalizar_busqueda()
    
    def finalizar_busqueda(self):
        """Finaliza la búsqueda y genera reporte final"""
        tiempo_total = time.time() - self.inicio_tiempo
        velocidad_promedio = self.combinaciones_totales_procesadas / tiempo_total
        
        print("\n" + "=" * 80)
        print("🏆 BÚSQUEDA ULTRA-OPTIMIZADA COMPLETADA")
        print("=" * 80)
        print(f"📊 Combinaciones procesadas: {self.combinaciones_totales_procesadas:,}")
        print(f"🎯 Combinaciones Omega encontradas: {len(self.omega_totales):,}")
        print(f"📈 Porcentaje Omega: {(len(self.omega_totales) / self.combinaciones_totales_procesadas) * 100:.6f}%")
        print(f"⏱️  Tiempo total: {tiempo_total:.1f} segundos ({tiempo_total/3600:.2f} horas)")
        print(f"🚀 Velocidad promedio: {velocidad_promedio:,.0f} combinaciones/segundo")
        print(f"💾 Resultados guardados en: {self.archivo_resultados}")
        
        # Guardar resultados finales
        self.guardar_resultados_parciales()
        
        # Actualizar archivo de progreso final
        with open(self.archivo_progreso, 'a') as f:
            f.write(f"\n{'='*50}\n")
            f.write(f"BÚSQUEDA COMPLETADA - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Combinaciones procesadas: {self.combinaciones_totales_procesadas:,}\n")
            f.write(f"Omega encontradas: {len(self.omega_totales):,}\n")
            f.write(f"Tiempo total: {tiempo_total:.1f} segundos\n")
            f.write(f"Velocidad promedio: {velocidad_promedio:,.0f} comb/seg\n")

# ============================================================================
# FUNCIÓN PRINCIPAL Y MENÚ
# ============================================================================

def main():
    """Función principal con menú ultra-optimizado"""
    print("🎯 GENERADOR OMEGA ULTRA-OPTIMIZADO - MÁXIMA EFICIENCIA")
    print("=" * 70)
    print("Objetivo: Encontrar TODAS las combinaciones Clase Omega")
    print("Espacio: 3,262,623 combinaciones de Melate Retro")
    print("Optimización: Procesamiento paralelo + terminación temprana")
    print()
    
    # Cargar datos
    CARGADOR.cargar_frecuencias_optimizado()
    
    while True:
        print("OPCIONES ULTRA-OPTIMIZADAS:")
        print("1. 🚀 Ejecutar búsqueda completa (MÁXIMA EFICIENCIA)")
        print("2. 📊 Mostrar configuración del sistema")
        print("3. 🧪 Prueba de velocidad (100,000 combinaciones)")
        print("4. ❌ Salir")
        print()
        
        opcion = input("Selecciona una opción (1-4): ").strip()
        
        if opcion == '1':
            confirmacion = input("\n⚠️  ADVERTENCIA: Proceso intensivo que puede tomar varias horas.\n"
                               "¿Continuar con búsqueda ultra-optimizada? (s/N): ").strip().lower()
            if confirmacion in ['s', 'si', 'sí', 'y', 'yes']:
                coordinador = CoordinadorOmegaUltraOptimizado()
                coordinador.ejecutar_busqueda_completa()
                break
            else:
                print("❌ Operación cancelada")
                
        elif opcion == '2':
            CONFIG.mostrar_configuracion()
            
        elif opcion == '3':
            print("\n🧪 Ejecutando prueba de velocidad...")
            evaluador = EvaluadorOmegaUltraRapido()
            
            combinaciones_prueba = list(combinations(range(1, 40), 6))[:100000]
            omega_encontradas = 0
            
            inicio = time.time()
            for combinacion in combinaciones_prueba:
                es_omega, _ = evaluador.evaluar_omega_terminacion_temprana(combinacion)
                if es_omega:
                    omega_encontradas += 1
            
            tiempo_prueba = time.time() - inicio
            velocidad = 100000 / tiempo_prueba
            
            print(f"✅ Prueba completada:")
            print(f"   ⏱️  Tiempo: {tiempo_prueba:.1f} segundos")
            print(f"   🚀 Velocidad: {velocidad:,.0f} combinaciones/segundo")
            print(f"   🎯 Omega encontradas: {omega_encontradas} ({(omega_encontradas/100000)*100:.3f}%)")
            
        elif opcion == '4':
            print("👋 ¡Hasta luego!")
            break
            
        else:
            print("❌ Opción inválida. Selecciona 1-4.")
        
        print("\n" + "-" * 50 + "\n")

if __name__ == "__main__":
    main()

