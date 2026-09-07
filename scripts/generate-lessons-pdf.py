#!/usr/bin/env python3
"""
Generate an A4-ready printable HTML Study Lessons Guide (دليل الدروس والملخصات التحضيرية لمسابقة الجمارك).
Covers Mauritanian Customs Code, Incoterms, Mauritanian History/Economy/Institutions, Public Finance, Arabic Grammar, and French Administrative Language.
"""

import os
import html

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_PATH = os.path.join(PROJECT_DIR, "all-lessons.html")

LESSONS_DATA = [
    {
        "id": "module-1",
        "title_ar": "الوحدة الأولى: التشريع والمدونة الجمركية الموريتانية",
        "title_fr": "Module 1 : Droit et Code des Douanes Mauritain",
        "sub": "قانون رقم 015-2026 والتنظيم الإداري والأنظمة الجمركية",
        "topics": [
            {
                "title": "1. المهام والرقابة والدائرة الجمركية",
                "content": """
                <ul>
                    <li><strong>الرقابة الجمركية (Contrôle douanier):</strong> هي الإجراءات الخاصة التي تقوم بها إدارة الجمارك لضمان التطبيق الصحيح للقوانين والتنظيمات الجمركية وغيرها من النصوص المطبقة على البضائع الخاضعة للمراقبة.</li>
                    <li><strong>الدائرة الجمركية (Circonscription douanière):</strong> هي منطقة مراقبة خاصة تُقام على طول الحدود والموانئ والمطارات. وتتكون من:
                        <ul>
                            <li><strong>منطقة بحرية:</strong> تمتد بين الشاطئ وخط يقع على عمق <strong>20 كم</strong> من خطوط الأساس للمياه الإقليمية.</li>
                            <li><strong>منطقة برية:</strong> تمتد على عمق <strong>20 كم</strong> من الشاطئ وشواطئ الأنهار وحول كل مكتب جمركي (دائرة قطرها 20 كم).</li>
                        </ul>
                    </li>
                    <li><strong>تسيير المخاطر (Gestion des risques):</strong> الكشف المنهجي عن المخاطر وتطبيق تدابير الحد منها بناءً على تحليل معطيات الاستيراد والتصدير.</li>
                    <li><strong>الوحدات الجمركية:</strong>
                        <ul>
                            <li><strong>المكتب الجمركي (Bureau de douane):</strong> الهيكل الإداري المختص بإتمام إجراءات الجمركة وتخليص البضائع.</li>
                            <li><strong>فرقة الجمارك (Brigade de douane):</strong> الهيكل الميداني المسند إليه مهمة الرقابة والبحث عن الغش والتهريب وردعه.</li>
                        </ul>
                    </li>
                </ul>
                """
            },
            {
                "title": "2. التصريح والوجهات والأنظمة الجمركية",
                "content": """
                <ul>
                    <li><strong>التصريح الموجز (Déclaration sommaire):</strong> بيان حمولة وسيلة النقل (السفينة، الطائرة، الشاحنة) المقدم قبل أو عند الوصول.</li>
                    <li><strong>التصريح المفصل (Déclaration détaillée):</strong> الإجراء القانوني الذي يحدد النظام الجمركي المراد إسناده للبضاعة.</li>
                    <li><strong>الوجهات الجمركية الأربع الحصرية للبضائع:</strong>
                        <ol>
                            <li>وضع البضائع تحت نظام جمركي.</li>
                            <li>إدخال البضائع إلى منطقة حرة.</li>
                            <li>إتلاف البضائع تحت رقابة الجمارك.</li>
                            <li>التخلي عن البضائع لصالح الخزينة العامة.</li>
                        </ol>
                    </li>
                    <li><strong>الأنظمة الجمركية الرئيسية (Régimes douaniers):</strong>
                        <ul>
                            <li><strong>الوضع للاستهلاك (Mise à la consommation):</strong> إدخال البضائع نهائيًا للتراب الوطني بعد استيفاء الرسوم والحقوق.</li>
                            <li><strong>العبور (Transit):</strong> نقل البضائع تحت الرقابة الجمركية من مكتب إلى آخر مع وقف الحقوق والرسوم.</li>
                            <li><strong>المستودع الجمركي (Entrepôt de douane):</strong> تخزين البضائع في محلات معتمدة مع تعليق الأداءات.</li>
                            <li><strong>الإدخال المؤقت (Admission temporaire):</strong> استيراد بضائع لاستعمال أو تصنيع مؤقت ثم إعادة تصديرها.</li>
                            <li><strong>التصدير (Exportation):</strong> إخراج البضائع الوطنية أو المجمركة من التراب الجمركي.</li>
                        </ul>
                    </li>
                </ul>
                """
            },
            {
                "title": "3. القيمة لدى الجمارك والمنشأ والتصنيف التعريفي",
                "content": """
                <ul>
                    <li><strong>القيمة لدى الجمارك (Valeur en douane):</strong> تُحسب للاستيراد على أساس <strong>قيمة الصفقة (Valeur transactionnelle)</strong> متضمنة تكاليف الشحن والتأمين حتى ميناء/مركز الدخول (CIF - CIF Nouakchott / Nouadhibou).</li>
                    <li><strong>قواعد المنشأ (Règles d'origine):</strong>
                        <ul>
                            <li><strong>منشأ تفضيلي (Origine préférentielle):</strong> يمنح تخفيضًا أو إعفاءً جمركيًا بموجب اتفاقيات تجارية (مثل اتفاقية منطقة التجارة الحرة القارية الأفريقية ZLECAF).</li>
                            <li><strong>منشأ غير تفضيلي:</strong> يُحدد البلد الذي تم فيه التحول الجوهري والأخير للبضاعة.</li>
                        </ul>
                    </li>
                    <li><strong>النظام المنسق لتسمية البضائع وتجميعها (Système Harmonisé - SH):</strong> تسمية دولية سداسية الأرقام (6 أرقام) صادرة عن منظمة الجمارك العالمية لتبويب وتصنيف السلع عالميًا.</li>
                </ul>
                """
            },
            {
                "title": "4. المنازعات والمخالفات الجمركية",
                "content": """
                <ul>
                    <li><strong>التهريب (Contrebande):</strong> استيراد أو تصدير بضائع خارج مكاتب الجمارك أو بدون تصريح موجز/مفصل أو عبر طرق غير معتمدة.</li>
                    <li><strong>المخالفات الجمركية:</strong> تختلف حسب درجة الجرم من مخالفات بسيطة (التأخير في التقديم) إلى جنح من الدرجة الأولى والثانية (التصريح الكاذب في القيمة أو المنشأ أو النوع).</li>
                    <li><strong>الصلح الجمركي (Transaction douanière):</strong> حق متاح لإدارة الجمارك لحل النزاعات الجمركية وتحديد الغرامات قبل أو بعد صدور الحكم القضائي.</li>
                    <li><strong>آجال التقادم:</strong> يحدد القانون فترة احتفاظ المتعاملين بالوثائق والجمركة لمدة لا تقل عن <strong>5 سنوات إدارية</strong>.</li>
                </ul>
                """
            }
        ]
    },
    {
        "id": "module-2",
        "title_ar": "الوحدة الثانية: مصطلحات التجارة الدولية والمنظمات العالمية",
        "title_fr": "Module 2 : Commerce International & Incoterms 2020",
        "sub": "منظمة الجمارك العالمية، منظمة التجارة الدولية، وقواعد Incoterms 2020",
        "topics": [
            {
                "title": "1. المنظمات الدولية والمعاهدات الجمركية",
                "content": """
                <ul>
                    <li><strong>منظمة الجمارك العالمية (Organisation Mondiale des Douanes - OMD / WCO):</strong> تأسست سنة 1952 (باسم مجلس التعاون الجمركي)، ومقرها في بروكسل. تتولى تطوير النظام المنسق واتفاقيات العبور والتبادل التكنولوجي.</li>
                    <li><strong>منظمة التجارة العالمية (Organisation Mondiale du Commerce - OMC / WTO):</strong> تأسست سنة 1995 بموجب اتفاقية مراكش (خلفًا للاتفاقية العامة للتعريفات والتجارة GATT)، ومقرها في جنيف.</li>
                    <li><strong>اتفاقية تيسير التجارة (Accord sur la Facilitation du Commerce - AFC):</strong> اتفاقية صادرة عن منظمة التجارة العالمية تهدف لتبسيط وتسريع الإجراءات الجمركية وشفافية الإجراءات.</li>
                </ul>
                """
            },
            {
                "title": "2. مصطلحات التجارة الدولية Incoterms 2020",
                "content": """
                <table class="lesson-table">
                    <thead>
                        <tr>
                            <th>المصطلح</th>
                            <th>الاسم الكامل (فرنسي/إنكليزي)</th>
                            <th>نقل المخاطر والتكاليف</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>EXW</strong></td>
                            <td>Ex Works (تسليم المصنع)</td>
                            <td>البائع يضع البضاعة في مصنعه؛ المشتري يتحمل كافة التكاليف والمخاطر والتصدير/الاستيراد.</td>
                        </tr>
                        <tr>
                            <td><strong>FOB</strong></td>
                            <td>Free On Board (تسليم على متن السفينة)</td>
                            <td>البائع يتحمل التكاليف ومخاطر الشحن حتى وضع البضاعة على متن السفينة بميناء المغادرة.</td>
                        </tr>
                        <tr>
                            <td><strong>CFR</strong></td>
                            <td>Cost and Freight (التكلفة وأجرة النقل)</td>
                            <td>البائع يدفع أجرة النقل للميناء، لكن مخاطر الفقدان تتنقل للمشتري بمجرد التحميل.</td>
                        </tr>
                        <tr>
                            <td><strong>CIF</strong></td>
                            <td>Cost, Insurance & Freight (التكلفة والتأمين والشحن)</td>
                            <td>البائع يدفع التكلفة وأجرة الشحن والتأمين البحري حتى ميناء الوصول (CIF Nouakchott).</td>
                        </tr>
                        <tr>
                            <td><strong>DAP</strong></td>
                            <td>Delivered At Place (تسليم في المكان المحدد)</td>
                            <td>البائع يتحمل النقل والمخاطر حتى المكان المحدد جاهزة للتفريغ دون رسوم الاستيراد.</td>
                        </tr>
                        <tr>
                            <td><strong>DDP</strong></td>
                            <td>Delivered Duty Paid (تسليم مع أداء الرسوم)</td>
                            <td>أقصى التزام على البائع؛ يتحمل جميع التكاليف والرسوم الجمركية والتخليص حتى موقع المشتري.</td>
                        </tr>
                    </tbody>
                </table>
                """
            }
        ]
    },
    {
        "id": "module-3",
        "title_ar": "الوحدة الثالثة: موريتانيا - التاريخ، الجغرافيا، الاقتصاد والمؤسسات",
        "title_fr": "Module 3 : Culture Générale — Mauritanie",
        "sub": "التطور التاريخي، الجغرافيا الإدارية، الموارد الاقتصادية والمالية العامة",
        "topics": [
            {
                "title": "1. المحطات التاريخية والدستورية الرئيسية",
                "content": """
                <ul>
                    <li><strong>سقوط عاصمة غانا (كمبي صالح):</strong> سنة 1076م على يد المرابطين.</li>
                    <li><strong>مقاومة الاستعمار:</strong> مقتل القائد الاستعماري كزافييه كوبولاني في معركة تجكجة سنة 1905، ووفاة الأمير سيدي أحمد سنة 1932.</li>
                    <li><strong>الاستقلال الوطني:</strong> أُعلنت الجمهورية في 28 نوفمبر 1958 والنواة الدستورية، وأُعلن الاستقلال التام عن فرنسا في <strong>28 نوفمبر 1960</strong> برئاسة المختار ولد داداه.</li>
                    <li><strong>تأسيس العاصمة نواكشوط:</strong> تم وضع حجر الأساس في 5 مارس 1958.</li>
                    <li><strong>دستور 1991 والتعديلات الدستورية:</strong>
                        <ul>
                            <li>دستور يوليو 1991 كرّس التعددية الحزبية.</li>
                            <li>تعديلات 2017: إلغاء مجلس الشيوخ، تعديل العلم الوطني (إضافة الشريطين الأحمدين) والنشيد الوطني.</li>
                            <li>النظام التشريعي حاليًا: برلمان من غرفة واحدة (الجمعية الوطنية - 157 نائبًا).</li>
                        </ul>
                    </li>
                </ul>
                """
            },
            {
                "title": "2. التنظيم الإداري والجغرافيا",
                "content": """
                <ul>
                    <li><strong>التقسيم الإداري:</strong> <strong>15 ولاية</strong> (بما فيها الولايات الثلاث لنواكشوط: الشمالية، الغربية، الجنوبية)، تنقسم إلى مقاطعات (Moughataa) وبلديات (Commune).</li>
                    <li><strong>الحدود والجغرافيا:</strong> المساحة 1,030,700 كم²، الساحل الأطلسي 754 كم، الحدود الأطول مع جمهورية مالي. أعلى قمة: <strong>كدية الجل (950م)</strong> قرب الزويرات.</li>
                    <li><strong>محمية حوض أرغين الوطنية (Banc d'Arguin):</strong> تأسست 1976، موقع تراث عالمي لليونسكو منذ 1989. الصيد مقتصر على سكان إيمراغن بالقوارب الشراعية التقليدية.</li>
                </ul>
                """
            },
            {
                "title": "3. الموارد الاقتصادية والمالية العامة",
                "content": """
                <ul>
                    <li><strong>القطاع المعدني:</strong> خام الحديد (شركة سنيم SNIM بالزويرات ونقل عبر قطار السكة الحديدية لميناء نواذيبو المستقل)، الذهب (تازيازت إينشيري)، النحاس (أكجوجت).</li>
                    <li><strong>قطاع الصيد البحري:</strong> عاصمة الصيد نواذيبو، يساهم بنسبة كبيرة في صادرات البلاد والعملات الصعبة والوظائف.</li>
                    <li><strong>الطاقة والغاز:</strong> مشروع غاز آحميم الكبير المشترك بين موريتانيا والسنغال (GTA).</li>
                    <li><strong>المالية العامة والقانون الإداري:</strong>
                        <ul>
                            <li><strong>قانون المالية (Loi de Finances):</strong> الوثيقة القانونية السنوية المقرة لميزانية الدولة وإيراداتها ونفقاتها.</li>
                            <li><strong>المبادئ الإدارية:</strong> الاستمرارية، المساواة، ومبدأ التدرج الهرمي للمرفق العمومي.</li>
                        </ul>
                    </li>
                </ul>
                """
            }
        ]
    },
    {
        "id": "module-4",
        "title_ar": "الوحدة الرابعة: دليل وقواعد اللغة العربية للمسابقة",
        "title_fr": "Module 4 : Langue Arabe (Grammaire, Morphologie & Rhétorique)",
        "sub": "ملخص أهم قواعد النحو والصرف والبلاغة والإملاء في المسابقات",
        "topics": [
            {
                "title": "1. النحو والإعراب (النواسخ والمنصوبات والمجرورات)",
                "content": """
                <ul>
                    <li><strong>كان وأخواتها (النواسخ الفعلية):</strong> تدخل على الجملة الاسمية فترفع المبتدأ اسمًا لها وتنصب الخبر خبرًا لها (كان، أصبح، أضحى، ظل، بات، صار، ليس، ما برح...).</li>
                    <li><strong>إن وأخواتها (النواسخ الحرفية):</strong> تنصب المبتدأ اسمًا لها وترفع الخبر خبرًا لها (إنّ، أنّ، كأنّ، لكنّ، ليت، لعلّ).</li>
                    <li><strong>الأفعال الخمسة:</strong> كل فعل مضارع اتصلت به ألف الاثنين أو واو الجماعة أو ياء المخاطبة. <strong>ترفع بثبوت النون وتنصب وتجزم بحذفها</strong> (مثال: يكتبون / لن يكتبوا / لم يكتبوا).</li>
                    <li><strong>الأسماء الخمسة:</strong> (أبوك، أخوك، حموك، فوك، ذو مال). ترفع بالواو، تنصب بالألف، وتجر بالياء بشرط إضافتها لغير ياء المتكلم.</li>
                    <li><strong>الممنوع من الصرف:</strong> اسم يرفع بالضمة وينصب ويجر بالفتحة دون تنوين (إلا إذا أُضيف أو عُرّف بأل فيجر بالكسرة).</li>
                </ul>
                """
            },
            {
                "title": "2. الصرف والبلاغة والإملاء",
                "content": """
                <ul>
                    <li><strong>المشتقات الصرفية:</strong> اسم الفاعل (فَاعِل / مُفْعِل)، اسم المفعول (مَفْعُول / مُفْعَل)، اسم المكان والزمان (مَفْعَل / مَفْعِل)، المصادر الأصلية والهيئة والمرّة.</li>
                    <li><strong>البلاغة:</strong>
                        <ul>
                            <li><strong>البيان:</strong> التشبيه (أركانه: مشبه، مشبه به، أداة، وجه شبه)، الاستعارة (تصريحية / مكنية)، الكناية.</li>
                            <li><strong>البديع:</strong> الطباق (سلب / إيجاب)، المقابلة، الجناس (تام / ناقص)، السجع.</li>
                        </ul>
                    </li>
                    <li><strong>قواعد الإملاء:</strong>
                        <ul>
                            <li><strong>همزة الوصل والقطع:</strong> الوصل في أمر الثلاثي ومضي الخماسي والسداسي و(أل) التعريف و(ابن، اسم، امرؤ). القطع في باقي ماضي الأفعال والأسماء والحروف.</li>
                            <li><strong>الهمزة المتوسطة:</strong> تكتب حسب أقوى الحركات (الكسرة > الضمة > الفتحة > السكون).</li>
                        </ul>
                    </li>
                </ul>
                """
            }
        ]
    },
    {
        "id": "module-5",
        "title_ar": "الوحدة الخامسة: دليل اللغة الفرنسية والإحاطة الإدارية",
        "title_fr": "Module 5 : Langue Française & Style Administratif",
        "sub": "Grammaire, Conjugaison, Concordance des temps et Rédaction Administrative",
        "topics": [
            {
                "title": "1. Grammaire et Conjugaison Clés",
                "content": """
                <ul>
                    <li><strong>Accord du Participe Passé :</strong>
                        <ul>
                            <li>Avec <em>être</em> : s'accorde en genre et en nombre avec le sujet (ex: <em>Les marchandises sont arrivées</em>).</li>
                            <li>Avec <em>avoir</em> : ne s'accorde <strong>jamais</strong> avec le sujet, mais s'accorde avec le <strong>COD</strong> si celui-ci est placé <strong>avant</strong> le verbe (ex: <em>Les déclarations qu'il a vérifiées</em>).</li>
                        </ul>
                    </li>
                    <li><strong>Concordance des Temps & Subjonctif :</strong>
                        <ul>
                            <li>Exigé après les expressions de doute, nécessité, volonté : <em>Il faut que la douane <strong>fasse</strong> les vérifications nécessaires.</em></li>
                            <li>Conditionnel pour exprimer l'hypothèse ou la politesse administrative.</li>
                        </ul>
                    </li>
                </ul>
                """
            },
            {
                "title": "2. Vocabulaire & Rédaction Administrative",
                "content": """
                <ul>
                    <li><strong>Termes administratifs courants :</strong>
                        <ul>
                            <li><strong>Procès-Verbal (PV) :</strong> Document officiel constatant une infraction douanière ou un fait juridique.</li>
                            <li><strong>Mainlevée :</strong> Autorisation accordée par la douane d'enlever les marchandises dédouanées.</li>
                            <li><strong>Contentieux :</strong> Ensemble des litiges relatifs aux infractions douanières.</li>
                            <li><strong>Ordonnateur & Comptable :</strong> L'ordonnateur engage la dépense/recette, le comptable exécute le paiement/recouvrement.</li>
                        </ul>
                    </li>
                    <li><strong>Connecteurs Logiques dans la Rédaction :</strong> <em>Conséquemment, Néanmoins, Nonobstant, En sus de, Conformément à l'article...</em></li>
                </ul>
                """
            }
        ]
    }
]


def esc(text):
    return html.escape(str(text))


def build_html():
    modules_html = []
    
    for mod in LESSONS_DATA:
        topics_html = []
        for top in mod["topics"]:
            topics_html.append(f'''
            <div class="topic-block">
                <h3 class="topic-title">{esc(top["title"])}</h3>
                <div class="topic-content">
                    {top["content"]}
                </div>
            </div>
            ''')
            
        modules_html.append(f'''
        <div class="module-card">
            <div class="module-header">
                <h2>{esc(mod["title_ar"])}</h2>
                <div class="module-fr">{esc(mod["title_fr"])}</div>
                <div class="module-sub">{esc(mod["sub"])}</div>
            </div>
            <div class="module-body">
                {"".join(topics_html)}
            </div>
        </div>
        ''')

    return f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>دليل الدروس والملخصات — مسابقة مفتشي الجمارك</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

:root {{
    --ink: #14261C;
    --green: #0E4D33;
    --green-dk: #082D1F;
    --brass: #A9812B;
    --paper: #EFEDE4;
    --paper-2: #FFFFFF;
    --stamp: #8E2B24;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: 'IBM Plex Sans Arabic', 'IBM Plex Sans', sans-serif;
    font-size: 13px;
    line-height: 1.7;
    color: var(--ink);
    background: var(--paper);
    padding: 0;
}}

@page {{
    size: A4 portrait;
    margin: 14mm 12mm;
}}

@media print {{
    body {{ background: white; padding: 0; font-size: 11px; }}
    .cover {{ page-break-after: always; }}
    .module-card {{ break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px; }}
    .no-print {{ display: none !important; }}
}}

/* Cover page */
.cover {{
    text-align: center;
    padding: 70px 30px;
    background: var(--paper-2);
    border: 2px solid var(--green);
    margin: 20px auto;
    max-width: 820px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}}
.cover img {{
    width: 130px;
    height: auto;
    margin-bottom: 25px;
}}
.cover h1 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 26px;
    color: var(--green-dk);
    margin-bottom: 12px;
}}
.cover .subtitle {{
    font-size: 18px;
    color: var(--brass);
    font-weight: 600;
    margin-bottom: 30px;
}}
.cover .intro-box {{
    font-size: 14px;
    color: var(--ink);
    line-height: 1.8;
    background: #f7f5ed;
    border-inline-start: 4px solid var(--brass);
    padding: 16px 20px;
    text-align: right;
    margin: 0 auto;
    max-width: 700px;
}}

/* Container */
.container {{
    max-width: 840px;
    margin: 0 auto;
    padding: 15px 20px;
}}

/* Module Card */
.module-card {{
    background: var(--paper-2);
    border: 1px solid #d8d3c5;
    margin-bottom: 24px;
    border-radius: 2px;
    overflow: hidden;
}}

.module-header {{
    background: var(--green-dk);
    color: white;
    padding: 18px 22px;
    border-inline-start: 6px solid var(--brass);
}}
.module-header h2 {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 20px;
    color: white;
    margin-bottom: 4px;
}}
.module-fr {{
    font-size: 13px;
    color: #d1e2d7;
    font-weight: 500;
    direction: ltr;
    text-align: right;
    margin-bottom: 6px;
}}
.module-sub {{
    font-size: 12px;
    color: #e2ce9f;
}}

.module-body {{
    padding: 18px 22px;
}}

/* Topic block */
.topic-block {{
    margin-bottom: 20px;
}}
.topic-block:last-child {{
    margin-bottom: 0;
}}
.topic-title {{
    font-family: 'Noto Kufi Arabic', serif;
    font-size: 15px;
    color: var(--green);
    border-bottom: 1px solid rgba(14,77,51,0.15);
    padding-bottom: 6px;
    margin-bottom: 10px;
}}
.topic-content {{
    font-size: 13px;
    line-height: 1.75;
    color: var(--ink);
}}

.topic-content ul, .topic-content ol {{
    padding-inline-start: 22px;
    margin-bottom: 10px;
}}
.topic-content li {{
    margin-bottom: 6px;
}}

/* Lesson table */
.lesson-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
}}
.lesson-table th, .lesson-table td {{
    border: 1px solid #d5d0c4;
    padding: 8px 12px;
    text-align: right;
}}
.lesson-table th {{
    background: #f0ebd9;
    color: var(--green-dk);
    font-weight: 600;
}}
.lesson-table tr:nth-child(even) {{
    background: #faf8f2;
}}

/* Print button */
.print-btn {{
    position: fixed;
    bottom: 24px;
    left: 24px;
    background: var(--green);
    color: white;
    border: none;
    padding: 14px 28px;
    font-size: 16px;
    font-family: 'Noto Kufi Arabic', serif;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 1000;
}}
.print-btn:hover {{
    background: var(--green-dk);
}}
</style>
</head>
<body>

<button class="print-btn no-print" onclick="window.print()">طباعة / حفظ PDF</button>

<div class="cover">
    <img src="public/emblem.png" alt="شعار الجمارك" onerror="this.style.display='none'">
    <h1>دليل الدروس والملخصات التحضيرية</h1>
    <div class="subtitle">مسابقة الاكتتاب المباشر في سلك مفتشي الجمارك — موريتانيا</div>
    <div class="intro-box">
        يحتوي هذا الدليل المرجعي الشامل على الملخصات والدروس الأساسية المقررة في اختبارات مسابقة الجمارك الموريتانية: التشريع والمدونة الجمركية، التجارة الدولية، الجغرافيا والتاريخ الموريتاني، المالية العامة، النحو والبلاغة العربية، والقواعد والأسلوب الإداري باللغة الفرنسية.
    </div>
</div>

<div class="container">
    {"".join(modules_html)}
</div>

</body>
</html>'''


def main():
    html_content = build_html()
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Generated Lessons HTML → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
