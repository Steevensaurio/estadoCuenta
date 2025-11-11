from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import requests
import xmlrpc.client, ast, time
from collections import defaultdict

@api_view(['GET'])
def datos(request):
    data = [{"mensaje": "Hola!"}, {"mensaje": "desde"},{"mensaje": "Django!"},{"mensaje": "mensaje de confirmacion"}]
    return Response(data)


def Login():

    usuario = "steevenandresmaila@gmail.com"
    contraseña = "Vasodeagua11"

    options = Options()
    #options.add_argument("--headless")  # opcional: sin abrir ventana
    options.add_argument("--disable-gpu")

    driver = webdriver.Chrome(options=options)
    driver.get("https://aromotor.com/web#action=204&model=account.move.line&view_type=list&cids=1&menu_id=124")

    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/main/div/form")))

    driver.find_element(By.XPATH, "/html/body/div[1]/main/div/form/div[1]/input").send_keys(usuario)
    driver.find_element(By.XPATH, "/html/body/div[1]/main/div/form/div[2]/input").send_keys(contraseña)
    driver.find_element(By.XPATH, "/html/body/div[1]/main/div/form/div[3]/button").click()

    return driver



@api_view(['GET'])
def obtener_datos_clientes(request):


    driver = Login()

    wait = WebDriverWait(driver, 20)
    wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[2]/div/div[1]/div[2]/div[2]/div[1]/div[3]/button")))
    time.sleep(3) 

    boton = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[1]/div[2]/div[2]/div[1]/div[3]/button')
    boton.click()

    boton = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[1]/div[2]/div[2]/div[1]/div[3]/ul/li[3]/a')
    boton.click()

    cliente = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[2]/div/div[1]/table/thead/div/th[6]/input')
    cliente.send_keys("RAMIREZ MENDOZA ANDRES ALCIDES", Keys.ENTER)

    time.sleep(5)

    boton = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[2]/div/div[1]/table/thead/tr/th[1]/div')
    boton.click()

    time.sleep(2)
    
    boton = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[1]/div[2]/div[1]/div[2]/div/button')
    boton.click()
    
    boton = driver.find_element(By.XPATH, '/html/body/div[2]/div/div[1]/div[2]/div[1]/div[2]/div/ul/li[1]/a')
    boton.click()

    wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[6]/div/div/div/div/div[2]/div[4]/div/select")))
    plantilla = driver.find_element(By.XPATH, "/html/body/div[6]/div/div/div/div/div[2]/div[4]/div/select")
    select = Select(plantilla)
    select.select_by_visible_text("Plantilla Buró de crédito")

    time.sleep(2)

    boton = driver.find_element(By.XPATH, '/html/body/div[6]/div/div/footer/button[1]')
    boton.click()


    #
    
    return Response(None)

@api_view(['GET'])
def obtener_apuntes_contables(request):

    usuario = "steevenandresmaila@gmail.com"
    contraseña = "Vasodeagua11"
    url = "https://aromotor.com"
    db = "aromotor"

    common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
    uid = common.authenticate(db, usuario, contraseña, {})

    if uid:
        print(f"✅ Conectado con UID: {uid}")
    else:
        print("❌ Error de autenticación")

    models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")


    filtros = models.execute_kw(
        db, uid, contraseña,
        'ir.filters', 'search_read',
        [[['model_id', '=', 'account.move.line']]],  # por ejemplo, apuntes contables
        {'fields': ['id', 'name', 'domain', 'user_id']}
    )

    filtro = next(f for f in filtros if f['name'] == 'PLANTILLA BURÓ DE CRÉDITO')
    domain_guardado = ast.literal_eval(filtro['domain'])
    domain = domain_guardado + [['partner_id', '=', 'RAMIREZ MENDOZA ANDRES ALCIDES']]

    apuntes = models.execute_kw(
        db, uid, contraseña,
        'account.move.line', 'search_read',
        [domain_guardado],
        {'fields': ['name', 'partner_id', 'date', 'date_maturity', 'move_name', 'debit', 'credit', 'balance', 'move_id'], 'limit': 50}
    )

# Crear un diccionario para no repetir consultas
    move_ids = list({a['move_id'][0] for a in apuntes if a['move_id']})

    # Obtener los datos de las facturas asociadas
    moves = models.execute_kw(
        db, uid, contraseña,
        'account.move', 'read',
        [move_ids],
        {'fields': ['id', 'amount_residual']}
    )

    # Pasar a diccionario para acceder rápido por ID
    residual_map = {m['id']: m['amount_residual'] for m in moves}

    # Combinar datos
    for a in apuntes:
        move = a['move_id']
        if move:
            move_id = move[0]
            a['amount_residual'] = residual_map.get(move_id, 0.0)
        else:
            a['amount_residual'] = 0.0

    return Response(apuntes)


@api_view(['GET'])
def obtener_cxc(request):
    usuario = "steevenandresmaila@gmail.com"
    contraseña = "Vasodeagua11"
    url = "https://aromotor.com"
    db = "aromotor"

    # --- Autenticación ---
    common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
    uid = common.authenticate(db, usuario, contraseña, {})

    if not uid:
        return Response({"error": "❌ Error de autenticación con Odoo"}, status=401)

    models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")

    # --- 1. Obtener facturas pendientes ---
    facturas = models.execute_kw(
        db, uid, contraseña,
        'account.move', 'search_read',
        [[
            ('move_type', '=', 'out_invoice'),
            ('payment_state', 'in', ['not_paid', 'partial']),
            ('state', '=', 'posted')
        ]],
        {
            'fields': [
                'id', 'name', 'partner_id', 'invoice_date',
                'amount_total', 'amount_residual'
            ],
        }
    )

    ids_facturas = [f['id'] for f in facturas]

    # --- 2. Obtener líneas contables ---
    lineas = models.execute_kw(
        db, uid, contraseña,
        'account.move.line', 'search_read',
        [[
            ('move_id', 'in', ids_facturas),
            ('date_maturity', '!=', False),
        ]],
        {
            'fields': [
                'move_id', 'name', 'account_id',
                'debit', 'credit', 'balance',
                'amount_residual', 'date_maturity'
            ]
        }
    )

    # --- 3. Obtener cheques en custodia ---
    cheques = models.execute_kw(
        db, uid, contraseña,
        'account.payment', 'search_read',
        [[
            ('payment_method_id.name', 'ilike', 'cheque'),
            ('payment_state', 'in', ['posted', 'in_custody', 'sent']),
            ('is_internal_transfer', '=', False)
        ]],
        {
            'fields': [
                'id', 'name', 'partner_id', 'amount',
                'payment_date', 'payment_state'
            ]
        }
    )

    # --- 4. Construir estructura de respuesta ---
    estado_cuentas = defaultdict(lambda: {'facturas': [], 'cheques': []})

    # Facturas
    for f in facturas:
        partner_id, partner_name = f['partner_id'] if f['partner_id'] else (None, 'Sin Cliente')
        estado_cuentas[partner_name]['facturas'].append({
            'id': f['id'],
            'numero': f['name'],
            'fecha': f['invoice_date'],
            'total': f['amount_total'],
            'pendiente': f['amount_residual'],
            'cuotas': []
        })

    # Cuotas (líneas contables)
    for l in lineas:
        move_id = l['move_id'][0] if l['move_id'] else None
        for partner, datos in estado_cuentas.items():
            for factura in datos['facturas']:
                if factura['id'] == move_id:
                    factura['cuotas'].append({
                        'descripcion': l['name'],
                        'vencimiento': l.get('date_maturity'),
                        'residual': l.get('amount_residual', 0),
                        'debit': l.get('debit', 0),
                        'credit': l.get('credit', 0)
                    })

    # Cheques
    for c in cheques:
        partner_id, partner_name = c['partner_id'] if c['partner_id'] else (None, 'Sin Cliente')
        estado_cuentas[partner_name]['cheques'].append({
            'numero': c['name'],
            'monto': c['amount'],
            'fecha': c['payment_date'],
            'estado': c['payment_state']
        })

    # --- Convertir a formato JSON limpio (lista) ---
    resultado = [
        {
            "cliente": cliente,
            "facturas": datos["facturas"],
            "cheques": datos["cheques"]
        }
        for cliente, datos in estado_cuentas.items()
    ]

    return Response(resultado)



@api_view(['GET'])
def filtros(request):
    usuario = "steevenandresmaila@gmail.com"
    contraseña = "Vasodeagua11"
    url = "https://aromotor.com"
    db = "aromotor"

    # --- Autenticación ---
    common = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/common")
    uid = common.authenticate(db, usuario, contraseña, {})
    if not uid:
        return Response({"error": "Error de autenticación"}, status=401)

    models = xmlrpc.client.ServerProxy(f"{url}/xmlrpc/2/object")

    # --- Buscar un pago específico ---
    pagos = models.execute_kw(
        db, uid, contraseña,
        'account.payment', 'search_read',
        [[
            ('payment_method_id.name', 'ilike', 'cheque'),
        ]],
        {'fields': ['id', 'name', 'amount', 'x_payment_invoice_ids'], 'limit': 3}
    )

    resultado = []

    for pago in pagos:
        facturas_relacionadas = []
        ids_facturas = pago.get('x_payment_invoice_ids', [])

        if ids_facturas:
            facturas_relacionadas = models.execute_kw(
                db, uid, contraseña,
                'account.payment.invoice', 'search_read',
                [[
                    ('id', 'in', ids_facturas),
                    ('to_pay', '=', True)
                ]],
                {'fields': [
                    'move_name', 'invoice_date', 'invoice_amount', 'invoice_residual','to_pay'
                ]}
            )

        resultado.append({
            "pago": {
                "id": pago['id'],
                "numero": pago['name'],
                "monto": pago['amount']
            },
            "facturas": facturas_relacionadas
        })

    return Response(resultado)