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

    fields = models.execute_kw(
        db, uid, contraseña,
        'account.pending.invoice', 'fields_get',
        [],
        {'attributes': ['string', 'help', 'type']}
    )


    return Response(fields)