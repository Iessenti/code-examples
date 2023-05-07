function setProductToShelf ({chosenEquipmentIndex, product, position, fromShelf,  shelfData }) {
    // product - классический объект продукта ProductDTO
    // position - left и bottom в сантиметрах относительно левой точки левого стеллажа и пола, абсолютно правильно
        // далее left - x или left_coord
    let left_coord = position.left
    let bottom_coord = position.bottom

    let current_module = state[chosenEquipmentIndex]

    // поиск нужного стеллажа путём сравнения х с аккумулирующей шириной предыдущих стеллажей
    // когда х больше текущего значения аккумулятора и меньше (аккумулятор + ширина следующего стеллажа), то мы записываем индекс стеллажа
    let bay_width_accumulator = 0 // значение аккумулятора
    let exact_bay_index; // индекс

    for (let i = 0; i < current_module.bays.length; i++) { // перебор массива стеллажей
        if ( left_coord >= (bay_width_accumulator + current_module.bays[i].bay_width) ) { // если х больше текущего значения аккумулятора + ширина стеллажа, то есть х правее правой грани стеллажа
            bay_width_accumulator += current_module.bays[i].bay_width // то мы увеличиваем аккумулятор на ширину стеллажа
        } else { // если же нет, то текущий индекс стеллажа и является верным
            exact_bay_index = i
            break
        }
    }

    // определяем в переменную истинный стеллаж
    let correct_bay = current_module.bays[exact_bay_index]

    // поиск нужной полки по такому же принципу, что и поиск нужного стеллажа
    let shelf_height_accumulator = 0 // значение аккумулятора
    let exact_shelf_index; // индекс
    let current_processing_shelves = correct_bay.shelves // выносим текущие полки в нужном стеллаже в переменную

    for (let i = 0; i < current_processing_shelves.length; i++) {
        if ( 
            bottom_coord 
            >= 
            shelf_height_accumulator + 
            // определение нужной полки происходит не просто по индексу, потому что полки инвертированы
                //current_processing_shelves[ Math.abs(current_processing_shelves.length - 1 - i )].shelf_height || 
                40
        ) {
            shelf_height_accumulator += 40
                //current_processing_shelves[ Math.abs(current_processing_shelves.length - 1 - i )].shelf_height
        } else {
            exact_shelf_index = i
            break
        }
    }
    // сейчас есть нужный стеллаж и нужная полка, а если нет, тогда мы просто возвращает стейт
    if ( exact_bay_index == undefined || exact_shelf_index == undefined ) {
        return state
    }
    
    // а если есть, идём дальше

    // массив всех продуктов на текущей полке
    const current_processing_products_array = current_module.bays[exact_bay_index].shelves[exact_shelf_index].facings

    // координата слева относительно полки
    let left_coord_on_shelf = left_coord - bay_width_accumulator 

    // проверка, не является ли продукт самым крайне правым
        // для этого нужно убедиться, что координата меньше общей ширины продуктов на полке

    // поиск суммарной ширины продуктов на полке
    let summary_products_width_on_shelf = 0
    current_processing_products_array.forEach( (cur_prod) => 
        summary_products_width_on_shelf += (cur_prod.sku_width || width_sku) / 10
    )
    
    // корректный индекс продукта на полке
    let product_final_index_on_shelf;

    // аккумулятор текущей суммарной ширины всех обработанных продуктов
    let products_width_accumulator = 0;
    if (
        left_coord_on_shelf >= summary_products_width_on_shelf // условие, по которому понятно, что продукт должен быть последним
    ) {
        product_final_index_on_shelf = current_processing_products_array.length // индекс продукта на полке равен длине массива, то есть продукт становится последним
    } else { // если же нет, нужно продолжать поиск, какое место будет иметь продукт


        for (let i = 0; i < current_processing_products_array.length; i++) {
            let current_processing_product_width = 
                (current_processing_products_array[i].sku_width || width_sku) / 10
                //products_list[current_processing_products_array[i].barcode].width
            if (
                product_final_index_on_shelf === undefined // условие необходимо, чтобы значение записывалось лишь единожды, а аккумуляция ширины продолжалась
                &&
                left_coord_on_shelf >= products_width_accumulator // наша точка правее левого продукта
                &&
                left_coord_on_shelf < (products_width_accumulator + current_processing_product_width) // наша точка левее правого продукта
                // значит, это нужное место, выходим из цикла
            ) {
                product_final_index_on_shelf = i // присваиваем текущий индекс
            } else {
                products_width_accumulator += current_processing_product_width
            }
        }
    }
    
    // добавляем к аккумулятору всей ширины ещё и добавленный продукт, тем самым формируя итоговую ширину всех продуктов на полке
    products_width_accumulator += (product.sku_width || width_sku) / 10

    // при обратной итерации продуктов на полке находим те продукты, которые уже не влазят на полку и их нужно убрать
        // то есть находим индекс продукта с конца, которого уже не должно быть на полке, который потом отправится в excess_products
    let descending_products_width_accumulator = products_width_accumulator

    // индекс последнего продукта на полке, все остальные за ним НЕ ВКЛЮЧАЯ ЕГО удаляются
    let last_product_on_shelf_index;
    
    // очевидно, эта проверка нужна только в том случае, если суммарная ширина всех продуктов, включая новый, больше ширины полки
    const shelf_width = correct_bay.bay_width

    if ( products_width_accumulator >= shelf_width ) {

        for (let i = current_processing_products_array.length-1; i >= 0; i--) {
            let current_processing_product_width = width_sku
            //products_list[current_processing_products_array[i].barcode].width // ширина текущего продукта
            if (
                descending_products_width_accumulator > shelf_width // если накопленная ширина всё ещё больше максимальной ширины (ширина стеллажа)
            ) {
                descending_products_width_accumulator -= current_processing_product_width // то здесь мы её убавляем на ширину последнего продукта
            } else {
                last_product_on_shelf_index = i // если же нет, то текущий продукт становится последним
                break
            }
        }    
    }

    // достаём текущую модель стеллажей для мутации
    let result_bays = current_module.bays
    let result_products_on_shelf_array = result_bays[ exact_bay_index ].shelves[ exact_shelf_index ].facings

    // сначала мы не добавляем продукт, а определить продукты, которые уже больше не влазят на нашу полку, так как last_product_on_shelf_index - для старой полки
    let deleted_products_from_shelf= []
    if (last_product_on_shelf_index !== undefined) { // если вообще есть продукты, которые не влазят на полку
        deleted_products_from_shelf = current_processing_products_array.slice( last_product_on_shelf_index ) // тут мы получаем список продуктов, которые нужно удалить с полки
        result_products_on_shelf_array.splice( last_product_on_shelf_index ) // тут мы удаляем все продукты, начиная с индекса последнего + 1
    } 
    
    // добавление продукта на полку
    result_products_on_shelf_array.splice( product_final_index_on_shelf, 0, product) 
    
    // окончательная мутация стеллажей, дальше result_bays должны идти в стейт (кроме удаления продукта с полки)
    result_bays[ exact_bay_index ].shelves[ exact_shelf_index ].facings = [...result_products_on_shelf_array]

    // следующий этап - это удаление продукта с полки, если продукт был с полки или из списка продуктов, если он был вне

    let product_id_for_deleting = -1
    let mutable_excess_products = current_module.products

    if (fromShelf && shelfData) { // если стоит флаг сПолки
        // данные с номером стеллажа, полки и удаляемого продукта приходят в пейлоад

        // здесь нужно проверить, не является ли удаляемый продукт с полки последним - для его удаления вызывается метод pop()
        if ( shelfData.productIndex +1 === result_bays[shelfData.bayIndex].shelves[ shelfData.shelfIndex ].facings.length-1) {
            result_bays[shelfData.bayIndex].shelves[ shelfData.shelfIndex ].facings.pop()
        } else {
            if ( shelfData.productIndex === product_final_index_on_shelf+1 ) {
                result_bays[shelfData.bayIndex].shelves[ shelfData.shelfIndex ].facings.splice( shelfData.productIndex+1, 1 ) 
            } else {
                result_bays[shelfData.bayIndex].shelves[ shelfData.shelfIndex ].facings.splice( shelfData.productIndex, 1 ) 
            }
        }               
    } else { // если же продукт тащим из excess_products
        // здесь итерационно ищем необходимый продукт в текущих excess_products и удаляем его
        for (var k = 0; k < mutable_excess_products.length; k++) {
            if (
                mutable_excess_products[k].barcode && mutable_excess_products[k].barcode === product.barcode
                ||
                mutable_excess_products[k].correct_barcode && mutable_excess_products[k].correct_barcode === product.correct_barcode
            ) {
                product_id_for_deleting = k
                break
            }
        }
        mutable_excess_products.splice(product_id_for_deleting, 1) // удаление из списка excess_products добавленного продукта
    } 

    // следующий этап - увеличение фейсингов (тут всё просто)\

    let current_analytics_changing = state[chosenEquipmentIndex].currentAnalytics

    deleted_products_from_shelf.forEach( (deleting_product) => {
        current_analytics_changing.manufacturers[deleting_product.manufacturer].manufacturer_facings -= 1

        current_analytics_changing.manufacturers[deleting_product.manufacturer].brands[deleting_product.brand].brand_facings -= 1

        current_analytics_changing.manufacturers[deleting_product.manufacturer].brands[deleting_product.brand].products[deleting_product.correct_barcode].product_facings -= 1

        current_analytics_changing.summary_facings_width -= width_sku
    })
    
    current_analytics_changing.manufacturers[product.manufacturer].manufacturer_facings += 1

    current_analytics_changing.manufacturers[product.manufacturer].brands[product.brand].brand_facings += 1

    current_analytics_changing.manufacturers[product.manufacturer].brands[product.brand].products[product.correct_barcode].product_facings += 1

    current_analytics_changing.summary_facings_width += width_sku
    
    return {
        ...state,
        [chosenEquipmentIndex]: {
            ...state[chosenEquipmentIndex],
            bays: [...result_bays],
            currentAnalytics: current_analytics_changing,
            products: [...deleted_products_from_shelf, ...mutable_excess_products],
        }
    }
}